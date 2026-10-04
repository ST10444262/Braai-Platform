import { render, screen } from "@testing-library/react";
import DashboardLayout from "@/app/(dashboard)/layout";
import { makeAuth } from "../helpers/testUtils";

const replace = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ replace }), usePathname: () => "/overview" }));
jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
import { useAuth } from "@/lib/auth";
const mockAuth = useAuth as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe("DashboardLayout", () => {
  it("shows a spinner and hides content while auth is loading", () => {
    mockAuth.mockReturnValue(makeAuth(null, { ready: false }));
    const { container } = render(<DashboardLayout><p>secret</p></DashboardLayout>);
    expect(screen.queryByText("secret")).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects signed-out visitors to /login and never renders the page", () => {
    mockAuth.mockReturnValue(makeAuth(null));
    render(<DashboardLayout><p>secret</p></DashboardLayout>);
    expect(replace).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("secret")).toBeNull();
  });

  it.each(["Employee", "Admin", "SuperAdmin"] as const)("renders the shell and children for %s", (role) => {
    mockAuth.mockReturnValue(makeAuth(role));
    render(<DashboardLayout><p>secret</p></DashboardLayout>);
    expect(screen.getByText("secret")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
