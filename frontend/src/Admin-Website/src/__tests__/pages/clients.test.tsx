import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientsPage from "@/app/(dashboard)/clients/page";
import { makeClient, routeGet } from "../helpers/testUtils";

jest.mock("@/lib/api", () => ({ api: { get: jest.fn() }, qs: jest.requireActual("@/lib/api").qs }));
jest.mock("@/components/ClientDrawer", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    ClientDrawer: (p: { clientId: string | null; onClose: () => void; onChanged: () => void }) =>
      React.createElement("div", { "data-testid": "client-drawer", "data-id": p.clientId ?? "" },
        React.createElement("button", { onClick: p.onClose }, "close-drawer"),
        React.createElement("button", { onClick: p.onChanged }, "drawer-changed")),
    CreateClientDrawer: (p: { open: boolean; onClose: () => void; onCreated: () => void }) =>
      p.open
        ? React.createElement("div", { "data-testid": "create-drawer" },
            React.createElement("button", { onClick: p.onClose }, "close-create"),
            React.createElement("button", { onClick: p.onCreated }, "created"))
        : null,
  };
});
import { api } from "@/lib/api";
const get = api.get as jest.Mock;

const client = (n: number, over: Record<string, unknown> = {}) =>
  makeClient({ clientId: `c${n}`, firstName: `Cli${n}`, lastName: `Ent${n}`, email: `client${n}@example.com`, phone: `07100000${n}`, ...over });

function stub(list: unknown[], invoices: Record<string, number> = {}) {
  routeGet(get, {
    "/admin/crm/clients": (path: string) => {
      const id = /clientId=([^&]+)/.exec(path)?.[1];
      if (!id) return list;
      const c = (list as { clientId: string }[]).find((x) => x.clientId === id)!;
      return [{ ...c, invoiceRecords: Array.from({ length: invoices[id] ?? 0 }, (_, i) => ({ invoiceId: `${id}-${i}` })) }];
    },
  });
}
const listCalls = () => get.mock.calls.filter(([p]) => p.includes("pageSize=1000")).length;
const rowFor = (name: string) => screen.getByText(name).closest("tr")!;

beforeEach(() => {
  jest.clearAllMocks();
  stub([client(1), client(2), client(3)], { c1: 2, c2: 0, c3: 1 });
});

describe("loading and errors", () => {
  it("shows a spinner while loading", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ClientsPage />);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });
  it("shows an error when the list fails", async () => {
    get.mockRejectedValue(new Error("Clients unavailable"));
    render(<ClientsPage />);
    expect(await screen.findByText("Clients unavailable")).toBeInTheDocument();
  });
  it("shows the empty state", async () => {
    stub([]);
    render(<ClientsPage />);
    expect(await screen.findByText("No clients found.")).toBeInTheDocument();
  });
});

describe("table", () => {
  it("lists clients with name, email and phone", async () => {
    render(<ClientsPage />);
    expect(await screen.findByText("Cli1 Ent1")).toBeInTheDocument();
    const row = rowFor("Cli1 Ent1");
    expect(within(row).getByText("client1@example.com")).toBeInTheDocument();
    expect(within(row).getByText("071000001")).toBeInTheDocument();
  });

  it("shows a placeholder, then each client's invoice count", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    expect(within(rowFor("Cli1 Ent1")).getByText("…")).toBeInTheDocument();
    await waitFor(() => expect(within(rowFor("Cli1 Ent1")).getByText("2")).toBeInTheDocument());
    expect(within(rowFor("Cli2 Ent2")).getByText("0")).toBeInTheDocument();
    expect(within(rowFor("Cli3 Ent3")).getByText("1")).toBeInTheDocument();
  });

  it("leaves the placeholder when a client's invoices cannot be loaded", async () => {
    get.mockImplementation((p: string) => (p.includes("clientId=") ? Promise.reject(new Error("x")) : Promise.resolve([client(1)])));
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    await waitFor(() => expect(get.mock.calls.length).toBeGreaterThan(1));
    expect(within(rowFor("Cli1 Ent1")).getByText("…")).toBeInTheDocument();
  });

  it("scrolls sideways instead of overflowing", async () => {
    const { container } = render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    expect(container.querySelector("table")!.parentElement!.className).toMatch(/overflow-x-auto/);
  });
});

describe("search and filter", () => {
  const search = (t: string) => userEvent.type(screen.getByPlaceholderText("Search clients..."), t);

  it.each([
    ["name", "cli2", "Cli2 Ent2"],
    ["email", "client3@", "Cli3 Ent3"],
    ["phone", "071000001", "Cli1 Ent1"],
  ])("searches by %s", async (_n, term, expected) => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    await search(term);
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    await search("zzz");
    expect(screen.getByText("No clients found.")).toBeInTheDocument();
  });

  it("filters to clients with invoices", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    await waitFor(() => expect(within(rowFor("Cli3 Ent3")).getByText("1")).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByRole("combobox"), "with");
    expect(screen.getByText("Cli1 Ent1")).toBeInTheDocument();
    expect(screen.getByText("Cli3 Ent3")).toBeInTheDocument();
    expect(screen.queryByText("Cli2 Ent2")).toBeNull();
  });

  it("filters to clients without invoices", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    await waitFor(() => expect(within(rowFor("Cli3 Ent3")).getByText("1")).toBeInTheDocument());
    await userEvent.selectOptions(screen.getByRole("combobox"), "none");
    expect(screen.getByText("Cli2 Ent2")).toBeInTheDocument();
    expect(screen.queryByText("Cli1 Ent1")).toBeNull();
  });
});

describe("pagination (8 per page)", () => {
  const ten = Array.from({ length: 10 }, (_, i) => client(i + 1));
  beforeEach(() => stub(ten));

  it("shows the first eight and the range", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    expect(screen.getAllByRole("row")).toHaveLength(9);
    expect(screen.getByText("Showing 1-8 of 10 clients")).toBeInTheDocument();
  });

  it("only fetches invoice details for the visible rows", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    await waitFor(() => expect(get.mock.calls.filter(([p]) => p.includes("clientId=")).length).toBe(8));
  });

  it("fetches the next rows when paging", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(screen.getByText("Showing 9-10 of 10 clients")).toBeInTheDocument();
    await waitFor(() => expect(get.mock.calls.filter(([p]) => p.includes("clientId=c10")).length).toBe(1));
  });
});

describe("drawers", () => {
  it("opens the client drawer for the clicked row", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli2 Ent2");
    expect(screen.getByTestId("client-drawer")).toHaveAttribute("data-id", "");
    await userEvent.click(within(rowFor("Cli2 Ent2")).getByRole("button", { name: "Manage" }));
    expect(screen.getByTestId("client-drawer")).toHaveAttribute("data-id", "c2");
  });

  it("closes the client drawer", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli2 Ent2");
    await userEvent.click(within(rowFor("Cli2 Ent2")).getByRole("button", { name: "Manage" }));
    await userEvent.click(screen.getByText("close-drawer"));
    expect(screen.getByTestId("client-drawer")).toHaveAttribute("data-id", "");
  });

  it("reloads the list when the drawer reports a change", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    expect(listCalls()).toBe(1);
    await userEvent.click(screen.getByText("drawer-changed"));
    await waitFor(() => expect(listCalls()).toBe(2));
  });

  it("opens and closes the create-client drawer", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    expect(screen.queryByTestId("create-drawer")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: /Create Client/ }));
    expect(screen.getByTestId("create-drawer")).toBeInTheDocument();
    await userEvent.click(screen.getByText("close-create"));
    expect(screen.queryByTestId("create-drawer")).toBeNull();
  });

  it("reloads the list after a client is created", async () => {
    render(<ClientsPage />);
    await screen.findByText("Cli1 Ent1");
    await userEvent.click(screen.getByRole("button", { name: /Create Client/ }));
    await userEvent.click(screen.getByText("created"));
    await waitFor(() => expect(listCalls()).toBe(2));
  });
});
