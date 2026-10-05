import { render, screen } from "@testing-library/react";
import UserDetailsPage from "@/app/(dashboard)/users/[id]/page";
import { makeAuth, makeStaff } from "../helpers/testUtils";

jest.mock("next/navigation", () => ({ 
  useParams: () => ({ id: "s1" }),
  useRouter: () => ({ push: jest.fn() })
}));
jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({ api: { get: jest.fn() }, qs: jest.requireActual("@/lib/api").qs }));
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
const get = api.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  (useAuth as jest.Mock).mockReturnValue(makeAuth("Admin"));
  get.mockResolvedValue([makeStaff()]);
});

describe("access", () => {
  it("blocks employees without calling the API", () => {
    (useAuth as jest.Mock).mockReturnValue(makeAuth("Employee"));
    render(<UserDetailsPage />);
    expect(screen.getByText("You don't have access to this page.")).toBeInTheDocument();
    expect(get).not.toHaveBeenCalled();
  });
  it("looks the user up by staff account id", async () => {
    render(<UserDetailsPage />);
    await screen.findByText("Ann Smith");
    expect(get).toHaveBeenCalledWith("/admin/account/staff?staffAccountId=s1");
  });
});

describe("loading states", () => {
  it("shows a spinner first", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<UserDetailsPage />);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });
  it("shows the API error", async () => {
    get.mockRejectedValue(new Error("Lookup failed"));
    render(<UserDetailsPage />);
    expect(await screen.findByText("Lookup failed")).toBeInTheDocument();
  });
  it("says the user was not found", async () => {
    get.mockResolvedValue([]);
    render(<UserDetailsPage />);
    expect(await screen.findByText("User not found.")).toBeInTheDocument();
  });
});

describe("details", () => {
  it("shows name, email and breadcrumb", async () => {
    render(<UserDetailsPage />);
    expect(await screen.findByRole("heading", { name: "Ann Smith" })).toBeInTheDocument();
    expect(screen.getByText("ann@inflame.co.za")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Admin Users" })).toHaveAttribute("href", "/users");
  });
  it("shows account status, creation date and quote-email preference", async () => {
    render(<UserDetailsPage />);
    await screen.findByText("Ann Smith");
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText(/15\s+Jan\.?\s+2026/)).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
  it("shows Inactive and No for a disabled user without quote emails", async () => {
    get.mockResolvedValue([makeStaff({ isActive: false, receiveQuoteEmails: false })]);
    render(<UserDetailsPage />);
    expect(await screen.findByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });
  it.each([
    ["Employee", "Employee"],
    ["Admin", "Admin"],
    ["SuperAdmin", "Super Admin"],
  ])("labels the %s role as '%s'", async (role, label) => {
    get.mockResolvedValue([makeStaff({ role })]);
    render(<UserDetailsPage />);
    await screen.findByText("Ann Smith");
    expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(2); // pill + tile
  });
  it("enables Edit and Delete buttons", async () => {
    render(<UserDetailsPage />);
    await screen.findByText("Ann Smith");
    expect(screen.getByRole("button", { name: /Edit Employee/ })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /Delete/ })).not.toBeDisabled();
  });
});
