import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OverviewPage from "@/app/(dashboard)/overview/page";
import { iso, makeAuth, makeEnquiry, routeGet } from "../helpers/testUtils";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({ api: { get: jest.fn() }, qs: jest.requireActual("@/lib/api").qs }));
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
const get = api.get as jest.Mock;

const overview = (over: Record<string, unknown> = {}) => ({
  leadPipeline: { new: 4, contacted: 3, converted: 2, dead: 1, conversionRate: 20 },
  catalogueStatus: { totalBraais: 12, totalFireplaces: 7 },
  recentQuoteRequests: [makeEnquiry({ enquiryId: "e1" }), makeEnquiry({ enquiryId: "e2", firstName: "Zed", lastName: "Mkhize", status: "Converted", product: null, productId: "p9", createdAt: iso(2 * 24 * 3_600_000) })],
  systemHealth: { apiConnection: "Operational", database: "Stable", redisCache: "Degraded", storageService: "Operational" },
  ...over,
});

beforeEach(() => {
  jest.resetAllMocks();
  (useAuth as jest.Mock).mockReturnValue(makeAuth("Admin"));
});

function load(data: unknown) {
  routeGet(get, { "/admin/overview": data, "/admin/products": [{ productId: "p9", name: "Mapped Fireplace" }] });
}

it("shows a spinner while loading", () => {
  get.mockReturnValue(new Promise(() => {}));
  const { container } = render(<OverviewPage />);
  expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
});

it("shows an error note when the overview fails to load", async () => {
  get.mockImplementation((p: string) => (p === "/admin/overview" ? Promise.reject(new Error("Server down")) : Promise.resolve([])));
  render(<OverviewPage />);
  expect(await screen.findByText("Server down")).toBeInTheDocument();
});

describe("loaded", () => {
  it("shows the lead pipeline counts and conversion rate", async () => {
    load(overview());
    render(<OverviewPage />);
    expect(await screen.findByText("20% Conversion Rate")).toBeInTheDocument();
    const pipeline = screen.getByText("Lead Pipeline").closest("div")!;
    ["New", "Contacted", "Converted", "Dead"].forEach((l) => expect(within(pipeline).getByText(l)).toBeInTheDocument());
    expect(within(pipeline).getByText("4")).toBeInTheDocument();
  });

  it("sizes pipeline bars proportionally to the total", async () => {
    load(overview());
    const { container } = render(<OverviewPage />);
    await screen.findByText("Lead Pipeline");
    const widths = Array.from(container.querySelectorAll<HTMLElement>("[style*='width']")).map((e) => e.style.width);
    expect(widths).toEqual(["40%", "30%", "20%", "10%"]);
  });

  it("does not divide by zero with an empty pipeline", async () => {
    load(overview({ leadPipeline: { new: 0, contacted: 0, converted: 0, dead: 0, conversionRate: 0 } }));
    const { container } = render(<OverviewPage />);
    await screen.findByText("0% Conversion Rate");
    container.querySelectorAll<HTMLElement>("[style*='width']").forEach((e) => expect(e.style.width).toBe("0%"));
  });

  it("shows catalogue totals", async () => {
    load(overview());
    render(<OverviewPage />);
    const row = (await screen.findByText("Total Braais")).closest("div")!.parentElement!;
    expect(within(row).getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Total Fireplaces").closest("div")!.parentElement).toHaveTextContent("7");
  });

  it("lists recent quote requests with names, products, times and statuses", async () => {
    load(overview());
    render(<OverviewPage />);
    expect(await screen.findByText("Thandi Nkosi")).toBeInTheDocument();
    expect(screen.getByText("Big Braai")).toBeInTheDocument();
    expect(screen.getByText("1 hour ago")).toBeInTheDocument();
    expect(screen.getByText("Zed Mkhize")).toBeInTheDocument();
    expect(await screen.findByText("Mapped Fireplace")).toBeInTheDocument();
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
    expect(within(screen.getByRole("table")).getByText("Converted")).toBeInTheDocument();
  });

  it("navigates to the lead when a row is clicked", async () => {
    load(overview());
    render(<OverviewPage />);
    await userEvent.click(await screen.findByText("Thandi Nkosi"));
    expect(push).toHaveBeenCalledWith("/leads/e1");
  });

  it("shows an empty state with no recent requests", async () => {
    load(overview({ recentQuoteRequests: [] }));
    render(<OverviewPage />);
    expect(await screen.findByText("No quote requests yet.")).toBeInTheDocument();
  });

  it("links to the full leads list", async () => {
    load(overview());
    render(<OverviewPage />);
    expect(await screen.findByRole("link", { name: /View all leads/ })).toHaveAttribute("href", "/leads");
  });
});

describe("system health", () => {
  it("shows each service with a green dot for Operational/Stable and red otherwise", async () => {
    load(overview());
    render(<OverviewPage />);
    await screen.findByText("System Health");
    const dotOf = (label: string) => screen.getByText(label).parentElement!.querySelector("span span")!;
    expect(screen.getByText("API Connection")).toBeInTheDocument();
    expect(dotOf("API Connection").className).toMatch(/emerald/);
    expect(dotOf("Database").className).toMatch(/emerald/);
    expect(dotOf("Redis Cache").className).toMatch(/red-500/);
    expect(screen.getByText("Degraded")).toBeInTheDocument();
  });

  it("hides the card when the API returns no health data", async () => {
    load(overview({ systemHealth: null }));
    render(<OverviewPage />);
    await screen.findByText("Lead Pipeline");
    expect(screen.queryByText("System Health")).toBeNull();
  });
});
