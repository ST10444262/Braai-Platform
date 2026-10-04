import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersPage from "@/app/(dashboard)/users/page";
import { makeAuth, makeStaff } from "../helpers/testUtils";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({ api: { get: jest.fn() }, qs: jest.requireActual("@/lib/api").qs }));
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
const get = api.get as jest.Mock;

const staff = (n: number, role: string, over: Record<string, unknown> = {}) =>
  makeStaff({ staffId: `s${n}`, fullName: `Person ${n}`, email: `person${n}@inflame.co.za`, role, ...over });
const USERS = [staff(1, "Employee"), staff(2, "Admin"), staff(3, "Employee"), staff(4, "SuperAdmin")];

beforeEach(() => {
  jest.clearAllMocks();
  (useAuth as jest.Mock).mockReturnValue(makeAuth("Admin"));
  get.mockResolvedValue(USERS);
});
const tab = (name: RegExp) => screen.getByRole("button", { name });

describe("access", () => {
  it("blocks employees without calling the API", () => {
    (useAuth as jest.Mock).mockReturnValue(makeAuth("Employee"));
    render(<UsersPage />);
    expect(screen.getByText("You don't have access to Admin Users.")).toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });
  it("does not show the access error while auth is still loading", () => {
    (useAuth as jest.Mock).mockReturnValue(makeAuth(null, { ready: false }));
    render(<UsersPage />);
    expect(screen.queryByText(/don't have access/)).toBeNull();
  });
  it("loads all staff for admins", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    expect(get).toHaveBeenCalledWith("/admin/account/staff?pageNumber=1&pageSize=1000");
  });
  it("loads staff for super admins", async () => {
    (useAuth as jest.Mock).mockReturnValue(makeAuth("SuperAdmin"));
    render(<UsersPage />);
    expect(await screen.findByText("Person 1")).toBeInTheDocument();
  });
});

describe("loading and errors", () => {
  it("shows a spinner first", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<UsersPage />);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });
  it("shows the API error", async () => {
    get.mockRejectedValue(new Error("Staff unavailable"));
    render(<UsersPage />);
    expect(await screen.findByText("Staff unavailable")).toBeInTheDocument();
  });
  it("shows the empty state", async () => {
    get.mockResolvedValue([]);
    render(<UsersPage />);
    expect(await screen.findByText("No users found.")).toBeInTheDocument();
  });
});

describe("table", () => {
  it("shows name, email and a readable role for each user", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    const row = (n: string) => screen.getByText(n).closest("tr")!;
    expect(within(row("Person 1")).getByText("person1@inflame.co.za")).toBeInTheDocument();
    expect(within(row("Person 1")).getByText("Employee")).toBeInTheDocument();
    expect(within(row("Person 2")).getByText("Admin")).toBeInTheDocument();
    expect(within(row("Person 4")).getByText("Super Admin")).toBeInTheDocument();
  });
  it("opens the user when the row is clicked", async () => {
    render(<UsersPage />);
    await userEvent.click(await screen.findByText("Person 3"));
    expect(push).toHaveBeenCalledWith("/users/s3");
  });
  it("links to the create-employee page", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    expect(screen.getByRole("link", { name: /Create Employee/ })).toHaveAttribute("href", "/users/new");
  });
  it("scrolls sideways instead of overflowing", async () => {
    const { container } = render(<UsersPage />);
    await screen.findByText("Person 1");
    expect(container.querySelector("table")!.parentElement!.className).toMatch(/overflow-x-auto/);
  });
});

describe("tabs", () => {
  it("shows the total on All Users", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    expect(tab(/^All Users\s*4$/)).toBeInTheDocument();
  });
  it("filters to employees", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    await userEvent.click(tab(/^Employee$/));
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.queryByText("Person 2")).toBeNull();
  });
  it("filters to admins (super admins appear only under All Users)", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    await userEvent.click(tab(/^Admin$/));
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Person 2")).toBeInTheDocument();
    expect(screen.queryByText("Person 4")).toBeNull();
    await userEvent.click(tab(/^All Users/));
    expect(screen.getByText("Person 4")).toBeInTheDocument();
  });
});

describe("search", () => {
  const search = (t: string) => userEvent.type(screen.getByPlaceholderText("Search Users"), t);
  it("matches by name", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    await search("person 3");
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });
  it("matches by email", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    await search("person2@");
    expect(screen.getByText("Person 2")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });
  it("shows the empty state for no match", async () => {
    render(<UsersPage />);
    await screen.findByText("Person 1");
    await search("nobody");
    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });
});

describe("pagination (8 per page)", () => {
  it("pages through a long list", async () => {
    get.mockResolvedValue(Array.from({ length: 10 }, (_, i) => staff(i + 1, "Employee")));
    render(<UsersPage />);
    await screen.findByText("Person 1");
    expect(screen.getByText("Showing 1-8 of 10 users")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(screen.getByText("Showing 9-10 of 10 users")).toBeInTheDocument();
    expect(screen.getByText("Person 10")).toBeInTheDocument();
  });
});
