import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LeadDetailsPage from "@/app/(dashboard)/leads/[id]/page";
import { ToastProvider } from "@/components/ui";
import { iso, makeEnquiry, routeGet } from "../helpers/testUtils";

jest.mock("next/navigation", () => ({ useParams: () => ({ id: "e1" }), useRouter: () => ({ push: jest.fn() }) }));
jest.mock("@/lib/api", () => ({ api: { get: jest.fn(), put: jest.fn() }, qs: jest.requireActual("@/lib/api").qs }));
import { api } from "@/lib/api";
const get = api.get as jest.Mock;
const put = api.put as jest.Mock;

function stub(enquiry: Record<string, unknown> | null) {
  routeGet(get, {
    "/admin/enquiries": enquiry ? [enquiry] : [],
    "/admin/products": [{ productId: "p9", name: "Mapped Fireplace" }],
  });
}
const renderPage = () =>
  render(
    <ToastProvider>
      <LeadDetailsPage />
    </ToastProvider>,
  );
const option = (s: string) => screen.getByText(s, { selector: "span.font-semibold" }).closest("label")!;
const updateBtn = () => screen.getByRole("button", { name: "Update Lead Status" });

beforeEach(() => {
  jest.resetAllMocks();
  stub(makeEnquiry());
  put.mockResolvedValue({});
});

describe("loading states", () => {
  it("looks the enquiry up by id", async () => {
    renderPage();
    await screen.findByRole("heading", { name: "Lead Details" });
    expect(get).toHaveBeenCalledWith("/admin/enquiries?enquiryId=e1");
  });
  it("shows a spinner first", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });
  it("shows an error when loading fails", async () => {
    get.mockImplementation((p: string) => (p.startsWith("/admin/enquiries") ? Promise.reject(new Error("Boom")) : Promise.resolve([])));
    renderPage();
    expect(await screen.findByText("Boom")).toBeInTheDocument();
  });
  it("says the lead was not found when the API returns nothing", async () => {
    stub(null);
    renderPage();
    expect(await screen.findByText("Lead not found.")).toBeInTheDocument();
  });
});

describe("lead information", () => {
  it("shows the breadcrumb, name and email", async () => {
    renderPage();
    expect(await screen.findByRole("heading", { name: "Thandi Nkosi" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lead Management" })).toHaveAttribute("href", "/leads");
    expect(screen.getByText("thandi@example.com")).toBeInTheDocument();
  });

  it("shows the requested product, phone, received time and source", async () => {
    renderPage();
    await screen.findByText("Big Braai");
    expect(screen.getByText("0821234567")).toBeInTheDocument();
    expect(screen.getByText("1 hour ago")).toBeInTheDocument();
    expect(screen.getByText("Quote")).toBeInTheDocument();
  });

  it("falls back to 'Not provided' and 'Website Quote Form'", async () => {
    stub(makeEnquiry({ phone: "", enquiryType: "" }));
    renderPage();
    expect(await screen.findByText("Not provided")).toBeInTheDocument();
    expect(screen.getByText("Website Quote Form")).toBeInTheDocument();
  });

  it("resolves a product name from the catalogue when only the id is known", async () => {
    stub(makeEnquiry({ product: null, productId: "p9" }));
    renderPage();
    expect(await screen.findByText("Mapped Fireplace")).toBeInTheDocument();
  });

  it("shows Custom Build and General Enquiry labels", async () => {
    stub(makeEnquiry({ product: null, customOptionId: "c1" }));
    const { unmount } = renderPage();
    expect(await screen.findByText("Custom Build")).toBeInTheDocument();
    unmount();
    stub(makeEnquiry({ product: null }));
    renderPage();
    expect(await screen.findByText("General Enquiry")).toBeInTheDocument();
  });

  it("shows the message when there is one and hides the block when there is not", async () => {
    stub(makeEnquiry({ message: "Line one\nLine two" }));
    const { unmount } = renderPage();
    expect(await screen.findByText(/Line one/)).toBeInTheDocument();
    unmount();
    stub(makeEnquiry({ message: "" }));
    renderPage();
    await screen.findByRole("heading", { name: "Lead Details" });
    expect(screen.queryByText("Message")).toBeNull();
  });

  it.each([
    [30_000, "Just now"],
    [5 * 60_000, "5 mins ago"],
    [3 * 3_600_000, "3 hours ago"],
    [24 * 3_600_000, "Yesterday"],
    [4 * 24 * 3_600_000, "4 days ago"],
  ])("formats the received time (%s ms ago) as '%s'", async (ms, label) => {
    stub(makeEnquiry({ createdAt: iso(ms), updatedAt: iso(ms) }));
    renderPage();
    expect(await screen.findByText(label)).toBeInTheDocument();
  });

  it("shows a calendar date for old leads", async () => {
    stub(makeEnquiry({ createdAt: "2025-01-15T10:00:00Z", updatedAt: "2025-01-15T10:00:00Z" }));
    renderPage();
    expect(await screen.findByText(/15\s+Jan\.?\s+2025/)).toBeInTheDocument();
  });
});

describe("status badge", () => {
  it("shows Under Review in the header, not New", async () => {
    stub(makeEnquiry({ status: "Under Review" }));
    renderPage();
    await screen.findByRole("heading", { name: "Thandi Nkosi" });
    const header = screen.getByRole("heading", { name: "Thandi Nkosi" }).closest("div")!.parentElement!;
    expect(within(header).getByText("Under Review")).toBeInTheDocument();
    expect(within(header).queryByText("New")).toBeNull();
  });
});

describe("updating status", () => {
  it("lists the five statuses with the current one selected", async () => {
    stub(makeEnquiry({ status: "Contacted" }));
    renderPage();
    await screen.findByText("Update Status");
    ["New", "Under Review", "Contacted", "Converted", "Dead"].forEach((s) => expect(option(s)).toBeInTheDocument());
    expect(option("Contacted").className).toMatch(/border-ink/);
    expect(option("Dead").className).not.toMatch(/border-ink/);
  });

  it("disables the button until a different status is chosen", async () => {
    renderPage();
    await screen.findByText("Update Status");
    expect(updateBtn()).toBeDisabled();
    await userEvent.click(option("Contacted"));
    expect(updateBtn()).toBeEnabled();
    await userEvent.click(option("New"));
    expect(updateBtn()).toBeDisabled();
  });

  it("saves the new status, toasts and reloads the lead", async () => {
    renderPage();
    await screen.findByText("Update Status");
    await userEvent.click(option("Under Review"));
    await userEvent.click(updateBtn());
    await waitFor(() => expect(put).toHaveBeenCalledWith("/admin/enquiries/e1/status", { status: "Under Review" }));
    expect(await screen.findByText("Lead status updated successfully.")).toBeInTheDocument();
    const enquiryLoads = get.mock.calls.filter(([p]) => p.startsWith("/admin/enquiries")).length;
    expect(enquiryLoads).toBe(2);
  });

  it("shows the API error and keeps the selection when saving fails", async () => {
    put.mockRejectedValue(new Error("Status change rejected"));
    renderPage();
    await screen.findByText("Update Status");
    await userEvent.click(option("Dead"));
    await userEvent.click(updateBtn());
    expect(await screen.findByText("Status change rejected")).toBeInTheDocument();
    expect(option("Dead").className).toMatch(/border-ink/);
  });
});

describe("activity timeline", () => {
  it("always shows the submission entry", async () => {
    stub(makeEnquiry({ createdAt: iso(3_600_000), updatedAt: iso(3_600_000) }));
    renderPage();
    expect(await screen.findByText("Enquiry submitted via website")).toBeInTheDocument();
    expect(screen.queryByText(/Lead status updated to/)).toBeNull();
  });

  it("adds a status entry once the lead has been updated", async () => {
    stub(makeEnquiry({ status: "Under Review", createdAt: iso(2 * 3_600_000), updatedAt: iso(1_000) }));
    renderPage();
    expect(await screen.findByText("Lead status updated to Under Review")).toBeInTheDocument();
    expect(screen.getByText("Enquiry submitted via website")).toBeInTheDocument();
  });
});
