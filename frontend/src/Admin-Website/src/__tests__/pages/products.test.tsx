import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductsPage from "@/app/(dashboard)/products/page";
import { makeAuth, makeProduct } from "../helpers/testUtils";

jest.mock("@/lib/auth", () => ({ useAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({ api: { get: jest.fn() }, qs: jest.requireActual("@/lib/api").qs }));
jest.mock("@/components/ProductDrawer", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    __esModule: true,
    default: (p: { open: boolean; product: { name: string } | null; defaultType: string; isAdmin: boolean; onClose: () => void; onChanged: () => void }) =>
      React.createElement("div", {
        "data-testid": "product-drawer",
        "data-open": String(p.open),
        "data-product": p.product?.name ?? "",
        "data-type": p.defaultType,
        "data-admin": String(p.isAdmin),
      },
      React.createElement("button", { onClick: p.onClose }, "close-drawer"),
      React.createElement("button", { onClick: p.onChanged }, "changed")),
  };
});
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
const get = api.get as jest.Mock;

const braai = (n: number, over: Record<string, unknown> = {}) =>
  makeProduct({ productId: `b${n}`, name: `Braai ${n}`, productType: "Braai", brand: `Brand${n}`, price: 1000 * n, ...over });
const fire = (n: number, over: Record<string, unknown> = {}) =>
  makeProduct({ productId: `f${n}`, name: `Fire ${n}`, productType: "Fireplace", brand: "", price: 500 * n, ...over });

const drawer = () => screen.getByTestId("product-drawer");
const setRole = (role: "Admin" | "Employee" | "SuperAdmin") => (useAuth as jest.Mock).mockReturnValue(makeAuth(role));

beforeEach(() => {
  jest.clearAllMocks();
  setRole("Admin");
  get.mockResolvedValue([braai(1), braai(2, { isVisible: false }), fire(1)]);
});

describe("loading and errors", () => {
  it("requests all products in one page", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    expect(get).toHaveBeenCalledWith("/admin/products?pageNumber=1&pageSize=1000");
  });
  it("shows a spinner while loading", () => {
    get.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ProductsPage />);
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });
  it("shows an error when loading fails", async () => {
    get.mockRejectedValue(new Error("Catalogue offline"));
    render(<ProductsPage />);
    expect(await screen.findByText("Catalogue offline")).toBeInTheDocument();
  });
});

describe("tabs", () => {
  it("starts on Braais", async () => {
    render(<ProductsPage />);
    expect(await screen.findByText("Braai 1")).toBeInTheDocument();
    expect(screen.queryByText("Fire 1")).toBeNull();
  });
  it("switches to Fireplaces and back", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    await userEvent.click(screen.getByRole("button", { name: "Fireplaces" }));
    expect(screen.getByText("Fire 1")).toBeInTheDocument();
    expect(screen.queryByText("Braai 1")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Braais" }));
    expect(screen.getByText("Braai 1")).toBeInTheDocument();
  });
  it("shows an empty state per tab", async () => {
    get.mockResolvedValue([braai(1)]);
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    await userEvent.click(screen.getByRole("button", { name: "Fireplaces" }));
    expect(screen.getByText("No fireplaces yet.")).toBeInTheDocument();
  });
  it("shows 'No braais yet.' when there are none", async () => {
    get.mockResolvedValue([fire(1)]);
    render(<ProductsPage />);
    expect(await screen.findByText("No braais yet.")).toBeInTheDocument();
  });
});

describe("table", () => {
  it("shows name, brand, formatted price and status", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    const row = screen.getByText("Braai 1").closest("tr")!;
    expect(within(row).getByText("Brand1")).toBeInTheDocument();
    expect(within(row).getByText("R 1,000")).toBeInTheDocument();
    expect(within(row).getByText("Active")).toBeInTheDocument();
    expect(within(screen.getByText("Braai 2").closest("tr")!).getByText("Draft")).toBeInTheDocument();
  });
  it("shows a dash when a product has no brand", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    await userEvent.click(screen.getByRole("button", { name: "Fireplaces" }));
    expect(within(screen.getByText("Fire 1").closest("tr")!).getByText("—")).toBeInTheDocument();
  });
  it("shows the primary image as the thumbnail, falling back to the first, then an icon", async () => {
    get.mockResolvedValue([
      braai(1, { images: [{ imageId: "i1", url: "/a.jpg", isPrimary: false }, { imageId: "i2", url: "/b.jpg", isPrimary: true }] }),
      braai(2, { images: [{ imageId: "i3", url: "/c.jpg", isPrimary: false }] }),
      braai(3, { images: [] }),
    ]);
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    expect(screen.getByText("Braai 1").closest("tr")!.querySelector("img")).toHaveAttribute("src", "/b.jpg");
    expect(screen.getByText("Braai 2").closest("tr")!.querySelector("img")).toHaveAttribute("src", "/c.jpg");
    expect(screen.getByText("Braai 3").closest("tr")!.querySelector("img")).toBeNull();
  });
  it("scrolls sideways instead of overflowing", async () => {
    const { container } = render(<ProductsPage />);
    await screen.findByText("Braai 1");
    expect(container.querySelector("table")!.parentElement!.className).toMatch(/overflow-x-auto/);
  });
});

describe("pagination (10 per page)", () => {
  beforeEach(() => get.mockResolvedValue(Array.from({ length: 12 }, (_, i) => braai(i + 1))));
  it("shows ten per page", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    expect(screen.getAllByRole("row")).toHaveLength(11);
    expect(screen.getByText("Showing 1-10 of 12 products")).toBeInTheDocument();
  });
  it("pages forward and resets when the tab changes", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    await userEvent.click(screen.getByLabelText("Next page"));
    expect(screen.getByText("Showing 11-12 of 12 products")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Fireplaces" }));
    await userEvent.click(screen.getByRole("button", { name: "Braais" }));
    expect(screen.getByText("Showing 1-10 of 12 products")).toBeInTheDocument();
  });
});

describe("add product", () => {
  it("is available to admins and opens the drawer in create mode for the current tab", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    expect(drawer()).toHaveAttribute("data-open", "false");
    await userEvent.click(screen.getByRole("button", { name: /Add Product/ }));
    expect(drawer()).toHaveAttribute("data-open", "true");
    expect(drawer()).toHaveAttribute("data-product", "");
    expect(drawer()).toHaveAttribute("data-type", "Braai");
  });
  it("defaults to Fireplace when added from the Fireplaces tab", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    await userEvent.click(screen.getByRole("button", { name: "Fireplaces" }));
    await userEvent.click(screen.getByRole("button", { name: /Add Product/ }));
    expect(drawer()).toHaveAttribute("data-type", "Fireplace");
  });
  it("is hidden from employees", async () => {
    setRole("Employee");
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    expect(screen.queryByRole("button", { name: /Add Product/ })).toBeNull();
    expect(drawer()).toHaveAttribute("data-admin", "false");
  });
});

describe("product drawer", () => {
  it("opens for the clicked product with the admin flag", async () => {
    render(<ProductsPage />);
    await userEvent.click(await screen.findByText("Braai 2"));
    expect(drawer()).toHaveAttribute("data-open", "true");
    expect(drawer()).toHaveAttribute("data-product", "Braai 2");
    expect(drawer()).toHaveAttribute("data-admin", "true");
  });
  it("closes again", async () => {
    render(<ProductsPage />);
    await userEvent.click(await screen.findByText("Braai 2"));
    await userEvent.click(screen.getByText("close-drawer"));
    expect(drawer()).toHaveAttribute("data-open", "false");
    expect(drawer()).toHaveAttribute("data-product", "");
  });
  it("reloads the catalogue when the drawer reports a change", async () => {
    render(<ProductsPage />);
    await screen.findByText("Braai 1");
    await userEvent.click(screen.getByText("changed"));
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  });
});
