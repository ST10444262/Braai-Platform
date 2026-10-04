import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Shell, { Logo } from "@/components/Shell";
import { makeAuth, makeMe } from "../helpers/testUtils";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));
jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const mockPath = usePathname as jest.Mock;
const mockAuth = useAuth as jest.Mock;

let errSpy: jest.SpyInstance;
beforeEach(() => {
  // clicking <a href> in jsdom logs "Not implemented: navigation"; keep the output clean
  errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  mockPath.mockReturnValue("/overview");
  mockAuth.mockReturnValue(makeAuth("Admin"));
});

afterEach(() => errSpy.mockRestore());

describe("Logo", () => {
  it("renders the brand and platform label", () => {
    render(<Logo />);
    expect(screen.getByText("inflame")).toBeInTheDocument();
    expect(screen.getByText("ADMIN PLATFORM")).toBeInTheDocument();
  });
});

describe("Shell navigation", () => {
  it("renders children inside main", () => {
    render(<Shell><p>page body</p></Shell>);
    expect(within(screen.getByRole("main")).getByText("page body")).toBeInTheDocument();
  });

  it("shows every nav item including Users for admins", () => {
    render(<Shell>x</Shell>);
    const desktop = screen.getAllByRole("navigation")[0];
    ["Overview", "Product Catalogue", "Lead Management", "Client Directory", "Users"].forEach((l) =>
      expect(within(desktop).getByRole("link", { name: l })).toBeInTheDocument(),
    );
  });

  it("hides Users for employees", () => {
    mockAuth.mockReturnValue(makeAuth("Employee"));
    render(<Shell>x</Shell>);
    screen.getAllByRole("navigation").forEach((nav) => expect(within(nav).queryByRole("link", { name: "Users" })).toBeNull());
  });

  it("links to the right routes", () => {
    render(<Shell>x</Shell>);
    const nav = screen.getAllByRole("navigation")[0];
    expect(within(nav).getByRole("link", { name: "Lead Management" })).toHaveAttribute("href", "/leads");
    expect(within(nav).getByRole("link", { name: "Client Directory" })).toHaveAttribute("href", "/clients");
  });

  it("highlights the active route, including nested ones", () => {
    mockPath.mockReturnValue("/leads/abc");
    render(<Shell>x</Shell>);
    const nav = screen.getAllByRole("navigation")[0];
    expect(within(nav).getByRole("link", { name: "Lead Management" }).className).toMatch(/bg-stone-200\/80/);
    expect(within(nav).getByRole("link", { name: "Overview" }).className).not.toMatch(/bg-stone-200\/80/);
  });
});

describe("Shell profile menu (desktop)", () => {
  it("is closed by default and opens on click showing the email", async () => {
    render(<Shell>x</Shell>);
    expect(screen.queryByText("me@inflame.co.za")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /Admin/ }));
    expect(screen.getByText("me@inflame.co.za")).toBeInTheDocument();
  });

  it("toggles closed on a second click", async () => {
    render(<Shell>x</Shell>);
    const trigger = screen.getByRole("button", { name: /Admin/ });
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(screen.queryByText("me@inflame.co.za")).toBeNull();
  });

  it("closes when clicking outside", async () => {
    render(<Shell><p>outside</p></Shell>);
    await userEvent.click(screen.getByRole("button", { name: /Admin/ }));
    await userEvent.click(screen.getByText("outside"));
    expect(screen.queryByText("me@inflame.co.za")).toBeNull();
  });

  it("closes after choosing My Profile", async () => {
    render(<Shell>x</Shell>);
    await userEvent.click(screen.getByRole("button", { name: /Admin/ }));
    const link = screen.getAllByRole("link", { name: /My Profile/ }).find((l) => l.className.includes("hover:bg-card"))!;
    await userEvent.click(link);
    expect(screen.queryByText("me@inflame.co.za")).toBeNull();
  });

  it("signs out from the dropdown", async () => {
    const auth = makeAuth("Admin");
    mockAuth.mockReturnValue(auth);
    render(<Shell>x</Shell>);
    await userEvent.click(screen.getByRole("button", { name: /Admin/ }));
    // the mobile slide-out also has a Sign out button; the dropdown one is rendered last
    const buttons = screen.getAllByRole("button", { name: /Sign out/ });
    await userEvent.click(buttons[buttons.length - 1]);
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it("shows the human-readable role label", () => {
    mockAuth.mockReturnValue(makeAuth("SuperAdmin"));
    render(<Shell>x</Shell>);
    expect(screen.getAllByText("Super Admin").length).toBeGreaterThan(0);
  });
});

describe("Shell mobile menu", () => {
  it("opens and closes the slide-out and locks body scroll", async () => {
    render(<Shell>x</Shell>);
    expect(document.body.style.overflow).toBe("");
    await userEvent.click(screen.getByLabelText("Open menu"));
    expect(document.body.style.overflow).toBe("hidden");
    await userEvent.click(screen.getByLabelText("Close menu"));
    expect(document.body.style.overflow).toBe("");
  });

  it("shows the signed-in user's name and signs out", async () => {
    const auth = makeAuth("Admin", { me: makeMe({ fullName: "Naledi Pillay" }) });
    mockAuth.mockReturnValue(auth);
    render(<Shell>x</Shell>);
    expect(screen.getByText("Naledi Pillay")).toBeInTheDocument();
    const signOut = screen.getAllByRole("button", { name: /Sign out/ })[0];
    await userEvent.click(signOut);
    expect(auth.logout).toHaveBeenCalled();
  });

  it("closes automatically when the route changes", async () => {
    const { rerender } = render(<Shell>x</Shell>);
    await userEvent.click(screen.getByLabelText("Open menu"));
    expect(document.body.style.overflow).toBe("hidden");
    mockPath.mockReturnValue("/leads");
    rerender(<Shell>x</Shell>);
    expect(document.body.style.overflow).toBe("");
  });

  it("links the top-bar avatar to the profile page", () => {
    render(<Shell>x</Shell>);
    expect(screen.getByLabelText("My profile")).toHaveAttribute("href", "/profile");
  });

  it("copes with a missing profile", () => {
    mockAuth.mockReturnValue(makeAuth("Admin", { me: null }));
    expect(() => render(<Shell>x</Shell>)).not.toThrow();
  });
});
