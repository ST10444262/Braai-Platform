import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeadsPage from "@/app/(dashboard)/leads/page";
import { makeEnquiry } from "../helpers/testUtils";

const push = jest.fn();
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/lib/api", () => ({ api: { get: jest.fn() }, qs: jest.requireActual("@/lib/api").qs }));
import { api } from "@/lib/api";
const get = api.get as jest.Mock;

const lead = (n: number, over: Record<string, unknown> = {}) =>
  makeEnquiry({ enquiryId: `e${n}`, firstName: `First${n}`, lastName: `Last${n}`, email: `lead${n}@example.com`, phone: `08200000${n}`, ...over });

const FIVE = [
  lead(1, { status: "New", product: null, customOptionId: "c1" }),
  lead(2, { status: "Under Review", product: { name: "Big Braai" } }),
  lead(3, { status: "Contacted", product: null }),
  lead(4, { status: "Converted" }),
  lead(5, { status: "Dead" }),
];

beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue(FIVE);
});

const tab = (name: RegExp) => screen.getByRole("button", { name });
async function loaded() {
  await screen.findByText("First1 Last1");
}

describe("loading and errors", () => {
  it("requests all enquiries in one page", async () => {
    render(<LeadsPage />);
    await loaded();
    expect(get).toHaveBeenCalledWith("/admin/enquiries?pageNumber=1&pageSize=1000");
  });
  it("shows a spinner while loading", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<LeadsPage />);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });
  it("shows the error message when the request fails", async () => {
    get.mockRejectedValue(new Error("Server down"));
    render(<LeadsPage />);
    expect(await screen.findByText("Server down")).toBeInTheDocument();
  });
  it("shows the empty state when there are no leads", async () => {
    get.mockResolvedValue([]);
    render(<LeadsPage />);
    expect(await screen.findByText("No leads found.")).toBeInTheDocument();
    expect(screen.getByText("Showing 0-0 of 0 leads")).toBeInTheDocument();
  });
});

describe("table", () => {
  it("renders every column heading", async () => {
    render(<LeadsPage />);
    await loaded();
    ["Customer", "Requested Product", "Contact", "Received", "Status", "Actions"].forEach((h) =>
      expect(screen.getByRole("columnheader", { name: h })).toBeInTheDocument(),
    );
  });

  it("shows customer name, email, phone and received time", async () => {
    render(<LeadsPage />);
    await loaded();
    const row = screen.getByText("First1 Last1").closest("tr")!;
    expect(within(row).getByText("lead1@example.com")).toBeInTheDocument();
    expect(within(row).getByText("082000001")).toBeInTheDocument();
    expect(within(row).getByText("1 hour ago")).toBeInTheDocument();
  });

  it("shows a dash when a lead has no phone number", async () => {
    get.mockResolvedValue([lead(1, { phone: "" })]);
    render(<LeadsPage />);
    await loaded();
    expect(within(screen.getByText("First1 Last1").closest("tr")!).getByText("-")).toBeInTheDocument();
  });

  it("labels the requested product: embedded name, custom build, or general enquiry", async () => {
    render(<LeadsPage />);
    await loaded();
    expect(within(screen.getByText("First1 Last1").closest("tr")!).getByText("Custom Build")).toBeInTheDocument();
    expect(within(screen.getByText("First2 Last2").closest("tr")!).getByText("Big Braai")).toBeInTheDocument();
    expect(within(screen.getByText("First3 Last3").closest("tr")!).getByText("General Enquiry")).toBeInTheDocument();
  });

  it("shows a status badge per row, including Under Review", async () => {
    render(<LeadsPage />);
    await loaded();
    const row = screen.getByText("First2 Last2").closest("tr")!;
    expect(within(row).getByText("Under Review")).toBeInTheDocument();
    expect(within(row).queryByText("New")).toBeNull();
  });

  it("is wrapped in a horizontal scroll container", async () => {
    const { container } = render(<LeadsPage />);
    await loaded();
    const table = container.querySelector("table")!;
    expect(table.parentElement!.className).toMatch(/overflow-x-auto/);
    expect(table.className).toMatch(/min-w-\[720px\]/);
  });
});

describe("navigation", () => {
  it("opens the lead when its row is clicked", async () => {
    render(<LeadsPage />);
    await loaded();
    await userEvent.click(screen.getByText("First4 Last4"));
    expect(push).toHaveBeenCalledWith("/leads/e4");
  });

  it("does not open the lead when the actions button is clicked", async () => {
    render(<LeadsPage />);
    await loaded();
    const row = screen.getByText("First1 Last1").closest("tr")!;
    await userEvent.click(within(row).getByRole("button"));
    expect(push).not.toHaveBeenCalled();
  });
});

describe("status tabs", () => {
  it("shows all six tabs with their counts", async () => {
    render(<LeadsPage />);
    await loaded();
    expect(tab(/^All Leads\s*5$/)).toBeInTheDocument();
    expect(tab(/^New\s*1$/)).toBeInTheDocument();
    expect(tab(/^Under Review\s*1$/)).toBeInTheDocument();
    expect(tab(/^Contacted\s*1$/)).toBeInTheDocument();
    expect(tab(/^Converted\s*1$/)).toBeInTheDocument();
    expect(tab(/^Dead\s*1$/)).toBeInTheDocument();
  });

  it("counts zero for statuses with no leads", async () => {
    get.mockResolvedValue([lead(1, { status: "New" })]);
    render(<LeadsPage />);
    await loaded();
    expect(tab(/^Under Review\s*0$/)).toBeInTheDocument();
    expect(tab(/^Dead\s*0$/)).toBeInTheDocument();
  });

  it("starts on All Leads showing everything", async () => {
    render(<LeadsPage />);
    await loaded();
    expect(screen.getAllByRole("row")).toHaveLength(6); // header + 5
    expect(tab(/^All Leads/).className).toMatch(/bg-ink/);
  });

  it.each([
    [/^New\s*\d/, "First1 Last1"],
    [/^Under Review\s*\d/, "First2 Last2"],
    [/^Contacted\s*\d/, "First3 Last3"],
    [/^Converted\s*\d/, "First4 Last4"],
    [/^Dead\s*\d/, "First5 Last5"],
  ])("filters to a single status (%s)", async (name, who) => {
    render(<LeadsPage />);
    await loaded();
    await userEvent.click(tab(name));
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText(who)).toBeInTheDocument();
  });

  it("returns to everything when All Leads is clicked again", async () => {
    render(<LeadsPage />);
    await loaded();
    await userEvent.click(tab(/^Dead/));
    await userEvent.click(tab(/^All Leads/));
    expect(screen.getAllByRole("row")).toHaveLength(6);
  });

  it("shows the empty state when a status has no leads", async () => {
    get.mockResolvedValue([lead(1, { status: "New" })]);
    render(<LeadsPage />);
    await loaded();
    await userEvent.click(tab(/^Dead/));
    expect(screen.getByText("No leads found.")).toBeInTheDocument();
  });

  it("does not show a colour dot on All Leads but does on the others", async () => {
    render(<LeadsPage />);
    await loaded();
    expect(tab(/^All Leads/).querySelector("span.rounded-full.h-1\\.5")).toBeNull();
    expect(tab(/^Under Review/).querySelector("span.bg-amber-500")).toBeInTheDocument();
    expect(tab(/^New\s*\d/).querySelector("span.bg-orange-500")).toBeInTheDocument();
    expect(tab(/^Converted/).querySelector("span.bg-purple-500")).toBeInTheDocument();
  });
});

describe("search", () => {
  const search = (text: string) => userEvent.type(screen.getByPlaceholderText("Search leads..."), text);

  it("matches by name, case-insensitively", async () => {
    render(<LeadsPage />);
    await loaded();
    await search("FIRST3");
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("First3 Last3")).toBeInTheDocument();
  });
  it("matches by email", async () => {
    render(<LeadsPage />);
    await loaded();
    await search("lead4@");
    expect(screen.getByText("First4 Last4")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });
  it("matches by phone number", async () => {
    render(<LeadsPage />);
    await loaded();
    await search("082000005");
    expect(screen.getByText("First5 Last5")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });
  it("ignores leading and trailing spaces", async () => {
    render(<LeadsPage />);
    await loaded();
    await search("  first2  ");
    expect(screen.getByText("First2 Last2")).toBeInTheDocument();
  });
  it("shows the empty state when nothing matches", async () => {
    render(<LeadsPage />);
    await loaded();
    await search("zzzz");
    expect(screen.getByText("No leads found.")).toBeInTheDocument();
  });
  it("combines with the status tab", async () => {
    render(<LeadsPage />);
    await loaded();
    await userEvent.click(tab(/^Dead/));
    await search("First1");
    expect(screen.getByText("No leads found.")).toBeInTheDocument();
  });
});

describe("pagination (6 per page)", () => {
  const many = Array.from({ length: 8 }, (_, i) => lead(i + 1, { status: i < 7 ? "New" : "Dead" }));
  beforeEach(() => get.mockResolvedValue(many));

  it("shows the first six leads and the range", async () => {
    render(<LeadsPage />);
    await loaded();
    expect(screen.getAllByRole("row")).toHaveLength(7);
    expect(screen.getByText("Showing 1-6 of 8 leads")).toBeInTheDocument();
    expect(screen.queryByText("First7 Last7")).toBeNull();
  });

  it("moves to the next page", async () => {
    render(<LeadsPage />);
    await loaded();
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(screen.getByText("Showing 7-8 of 8 leads")).toBeInTheDocument();
    expect(screen.getByText("First7 Last7")).toBeInTheDocument();
    expect(screen.queryByText("First1 Last1")).toBeNull();
  });

  it("goes back to page one when changing tab", async () => {
    render(<LeadsPage />);
    await loaded();
    await userEvent.click(screen.getByLabelText("Next page"));
    await userEvent.click(tab(/^Dead/));
    expect(screen.getByText("Showing 1-1 of 1 leads")).toBeInTheDocument();
  });

  it("goes back to page one when searching", async () => {
    render(<LeadsPage />);
    await loaded();
    await userEvent.click(screen.getByLabelText("Next page"));
    await userEvent.type(screen.getByPlaceholderText("Search leads..."), "First");
    expect(screen.getByText("Showing 1-6 of 8 leads")).toBeInTheDocument();
  });
});
