import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductDrawer from "@/components/ProductDrawer";
import { ToastProvider } from "@/components/ui";
import { makeProduct } from "../helpers/testUtils";

jest.mock("@/lib/api", () => ({ api: { form: jest.fn(), del: jest.fn() } }));
import { api } from "@/lib/api";
const form = api.form as jest.Mock;
const del = api.del as jest.Mock;

const onClose = jest.fn();
const onChanged = jest.fn();

type Props = Partial<React.ComponentProps<typeof ProductDrawer>>;
function renderDrawer(props: Props = {}) {
  const base = { open: true, product: null, defaultType: "Braai" as const, isAdmin: true, onClose, onChanged };
  const ui = (p: Props) => (
    <ToastProvider>
      <ProductDrawer {...base} {...p} />
    </ToastProvider>
  );
  const view = render(ui(props));
  return { ...view, update: (p: Props) => view.rerender(ui({ ...props, ...p })) };
}

const IMAGES = [
  { imageId: "i1", url: "/one.jpg", isPrimary: true },
  { imageId: "i2", url: "/two.jpg", isPrimary: false },
];
const existing = (over: Record<string, unknown> = {}) =>
  makeProduct({ price: 12500, braaiType: "Built-in", fuelType: "Gas", brand: "Weber", description: "A big one", ...over }) as never;

const field = (label: string) => screen.getByLabelText(label);
const saveBtn = () => screen.getByRole("button", { name: "Save Product" });
const fdOf = (call: number) => form.mock.calls[call][1] as FormData;
const dropzoneInput = () => document.querySelector("input[type=file]") as HTMLInputElement;
const png = (name = "pic.png") => new File(["x"], name, { type: "image/png" });

beforeEach(() => {
  jest.clearAllMocks();
  form.mockResolvedValue({});
  del.mockResolvedValue({});
});

describe("create mode", () => {
  it("shows the add-product form with an editable category", () => {
    renderDrawer({ product: null, defaultType: "Braai" });
    expect(screen.getByText("Add New Product")).toBeInTheDocument();
    expect(field("Product Category")).toBeEnabled();
    expect(field("Product Category")).toHaveValue("Braai");
    expect(screen.queryByText("Product Info")).toBeNull();
  });
  it("defaults to the Fireplace category when opened from that tab", () => {
    renderDrawer({ product: null, defaultType: "Fireplace" });
    expect(field("Product Category")).toHaveValue("Fireplace");
    expect(screen.getByLabelText("Heat Output (kW)")).toBeInTheDocument();
    expect(screen.queryByText("Fuel Type")).toBeNull();
  });
  it("swaps between braai and fireplace fields when the category changes", async () => {
    renderDrawer({ product: null });
    expect(screen.getByText("Fuel Type")).toBeInTheDocument();
    expect(screen.getByText("Braai Type")).toBeInTheDocument();
    await userEvent.selectOptions(field("Product Category"), "Fireplace");
    expect(screen.getByLabelText("Heat Output (kW)")).toBeInTheDocument();
    expect(screen.queryByText("Fuel Type")).toBeNull();
    await userEvent.selectOptions(field("Product Category"), "Braai");
    expect(screen.getByText("Fuel Type")).toBeInTheDocument();
  });
  it("cancel closes the drawer", async () => {
    renderDrawer({ product: null });
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });

  describe("validation", () => {
    it("requires a name", async () => {
      renderDrawer({ product: null });
      await userEvent.click(saveBtn());
      expect(await screen.findByText("Product name is required.")).toBeInTheDocument();
      expect(form).not.toHaveBeenCalled();
    });
    it("rejects a negative price", async () => {
      renderDrawer({ product: null });
      await userEvent.type(field("Name"), "Test");
      await userEvent.type(field("Base Price (ZAR)"), "-5");
      await userEvent.click(saveBtn());
      expect(await screen.findByText("Enter a valid price.")).toBeInTheDocument();
      expect(form).not.toHaveBeenCalled();
    });
  });

  describe("saving a braai", () => {
    async function fillBraai() {
      await userEvent.type(field("Name"), "  Mega Braai ");
      await userEvent.type(field("Base Price (ZAR)"), "9999.5");
      await userEvent.type(field("Special Price (optional)"), "8500");
      await userEvent.type(field("Brand"), " Weber ");
      await userEvent.type(field("Description"), "Great braai");
      await userEvent.click(screen.getByText("Charcoal", { selector: "button" }));
      await userEvent.click(screen.getByText("Freestanding", { selector: "button" }));
    }
    it("posts multipart data with braai fields", async () => {
      renderDrawer({ product: null, defaultType: "Braai" });
      await fillBraai();
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalledTimes(1));
      expect(form.mock.calls[0][0]).toBe("/admin/products");
      expect(form.mock.calls[0][2]).toBeUndefined(); // POST
      const fd = fdOf(0);
      expect(fd.get("Name")).toBe("Mega Braai");
      expect(fd.get("Category")).toBe("Freestanding");
      expect(fd.get("ProductType")).toBe("Braai");
      expect(fd.get("Brand")).toBe("Weber");
      expect(fd.get("Price")).toBe("9999.5");
      expect(fd.get("OnSpecial")).toBe("8500");
      expect(fd.get("Description")).toBe("Great braai");
      expect(fd.get("IsVisible")).toBe("true");
      expect(fd.get("IsImported")).toBe("false");
      expect(fd.get("IsCustomisable")).toBe("false");
      expect(fd.get("FuelType")).toBe("Charcoal");
      expect(fd.get("BraaiType")).toBe("Freestanding");
      expect(fd.has("HeatOutputKw")).toBe(false);
    });
    it("toasts, refreshes the list and closes", async () => {
      renderDrawer({ product: null });
      await fillBraai();
      await userEvent.click(saveBtn());
      expect(await screen.findByText("Product created.")).toBeInTheDocument();
      expect(onChanged).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
    it("omits OnSpecial when left blank", async () => {
      renderDrawer({ product: null });
      await userEvent.type(field("Name"), "Plain");
      await userEvent.type(field("Base Price (ZAR)"), "100");
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalled());
      expect(fdOf(0).has("OnSpecial")).toBe(false);
    });
    it("sends status, imported and customisable flags", async () => {
      renderDrawer({ product: null });
      await userEvent.type(field("Name"), "Flags");
      await userEvent.type(field("Base Price (ZAR)"), "100");
      await userEvent.click(screen.getByText("Draft", { selector: "button" }));
      await userEvent.click(screen.getByLabelText("Imported"));
      await userEvent.click(screen.getByLabelText("Customisable"));
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalled());
      const fd = fdOf(0);
      expect(fd.get("IsVisible")).toBe("false");
      expect(fd.get("IsImported")).toBe("true");
      expect(fd.get("IsCustomisable")).toBe("true");
    });
    it("shows the API error and stays open when saving fails", async () => {
      form.mockRejectedValue(new Error("Name already exists"));
      renderDrawer({ product: null });
      await userEvent.type(field("Name"), "Dup");
      await userEvent.type(field("Base Price (ZAR)"), "1");
      await userEvent.click(saveBtn());
      expect(await screen.findByText("Name already exists")).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("saving a fireplace", () => {
    it("posts fireplace fields instead of braai fields", async () => {
      renderDrawer({ product: null, defaultType: "Fireplace" });
      await userEvent.type(field("Name"), "Cosy Fire");
      await userEvent.type(field("Base Price (ZAR)"), "20000");
      await userEvent.type(field("Heat Output (kW)"), "12");
      await userEvent.type(field("Fireplace Type"), "Insert");
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalled());
      const fd = fdOf(0);
      expect(fd.get("ProductType")).toBe("Fireplace");
      expect(fd.get("Category")).toBe("Insert");
      expect(fd.get("HeatOutputKw")).toBe("12");
      expect(fd.get("FireplaceType")).toBe("Insert");
      expect(fd.has("FuelType")).toBe(false);
      expect(fd.has("BraaiType")).toBe(false);
    });
  });

  describe("image upload", () => {
    it("attaches chosen images to the request", async () => {
      renderDrawer({ product: null });
      await userEvent.type(field("Name"), "With pics");
      await userEvent.type(field("Base Price (ZAR)"), "1");
      await userEvent.upload(dropzoneInput(), [png("a.png"), png("b.png")]);
      expect(screen.getByText("a.png")).toBeInTheDocument();
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalled());
      expect((fdOf(0).getAll("Images") as File[]).map((f) => f.name)).toEqual(["a.png", "b.png"]);
    });
    it("lets a chosen image be removed before saving", async () => {
      renderDrawer({ product: null });
      await userEvent.upload(dropzoneInput(), [png("a.png"), png("b.png")]);
      await userEvent.click(within(screen.getByText("a.png").closest("li")!).getByRole("button"));
      expect(screen.queryByText("a.png")).toBeNull();
      expect(screen.getByText("b.png")).toBeInTheDocument();
    });
    it("skips images over 5 MB", async () => {
      renderDrawer({ product: null });
      const big = png("big.png");
      Object.defineProperty(big, "size", { value: 6 * 1024 * 1024 });
      await userEvent.upload(dropzoneInput(), [big, png("small.png")]);
      expect(await screen.findByText("Images over 5 MB were skipped.")).toBeInTheDocument();
      expect(screen.queryByText("big.png")).toBeNull();
      expect(screen.getByText("small.png")).toBeInTheDocument();
    });
    it("hides the uploader from non-admins", () => {
      renderDrawer({ product: null, isAdmin: false });
      expect(dropzoneInput()).toBeNull();
    });
  });
});

describe("view mode", () => {
  it("shows the product read-only", () => {
    renderDrawer({ product: existing() });
    expect(screen.getByText("Product Details")).toBeInTheDocument();
    expect(field("Name")).toHaveValue("Big Braai");
    expect(field("Name")).toBeDisabled();
    expect(field("Base Price (ZAR)")).toHaveValue(12500);
    expect(field("Base Price (ZAR)")).toBeDisabled();
    expect(field("Brand")).toHaveValue("Weber");
    expect(field("Description")).toBeDisabled();
    expect(field("Product Category")).toBeDisabled();
  });
  it("shows the product info panel", () => {
    renderDrawer({ product: existing() });
    const panel = screen.getByText("Product Info").parentElement!;
    expect(within(panel).getByText("Active")).toBeInTheDocument();
    expect(within(panel).getByText("Braai")).toBeInTheDocument();
    expect(within(panel).getByText(/01\s+Jan\.?\s+2026/)).toBeInTheDocument();
    expect(within(panel).getByText(/01\s+Feb\.?\s+2026/)).toBeInTheDocument();
  });
  it("shows Draft for hidden products", () => {
    renderDrawer({ product: existing({ isVisible: false }) });
    expect(within(screen.getByText("Product Info").parentElement!).getByText("Draft")).toBeInTheDocument();
  });
  it("shows the primary image large and a Primary badge on its thumbnail", () => {
    renderDrawer({ product: existing({ images: IMAGES }) });
    const imgs = Array.from(document.querySelectorAll("img"));
    expect(imgs[0]).toHaveAttribute("src", "/one.jpg");
    expect(imgs).toHaveLength(3); // hero + two thumbnails
    expect(screen.getByText("Primary")).toBeInTheDocument();
  });
  it("offers Delete, Cancel and Edit to admins", () => {
    renderDrawer({ product: existing() });
    expect(screen.getByRole("button", { name: "Delete Product" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Product" })).toBeInTheDocument();
  });
  it("hides Delete from non-admins", () => {
    renderDrawer({ product: existing(), isAdmin: false });
    expect(screen.queryByRole("button", { name: "Delete Product" })).toBeNull();
    expect(screen.getByRole("button", { name: "Edit Product" })).toBeInTheDocument();
  });
  it("Cancel closes the drawer", async () => {
    renderDrawer({ product: existing() });
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
  });
  it("shows fireplace fields for fireplaces", () => {
    renderDrawer({ product: existing({ productType: "Fireplace", heatOutputKw: 9, fireplaceType: "Insert" }) });
    expect(screen.getByLabelText("Heat Output (kW)")).toHaveValue(9);
    expect(screen.getByLabelText("Fireplace Type")).toHaveValue("Insert");
  });
  it("reloads the form when a different product is shown", () => {
    const { update } = renderDrawer({ product: existing() });
    update({ product: existing({ productId: "p2", name: "Other Braai" }) });
    expect(field("Name")).toHaveValue("Other Braai");
  });
});

describe("edit mode", () => {
  const edit = () => userEvent.click(screen.getByRole("button", { name: "Edit Product" }));

  it("unlocks the fields and renames the drawer", async () => {
    renderDrawer({ product: existing() });
    await edit();
    expect(screen.getByText("Edit Product", { selector: "h2" })).toBeInTheDocument();
    expect(field("Name")).toBeEnabled();
    expect(field("Base Price (ZAR)")).toBeEnabled();
    expect(field("Product Category")).toBeDisabled();
  });
  it("Cancel returns to view mode without closing", async () => {
    renderDrawer({ product: existing() });
    await edit();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Product Details")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
  it("locks prices for non-admins", async () => {
    renderDrawer({ product: existing(), isAdmin: false });
    await edit();
    expect(field("Name")).toBeEnabled();
    expect(field("Base Price (ZAR)")).toBeDisabled();
    expect(field("Special Price (optional)")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Delete Product" })).toBeNull();
    expect(dropzoneInput()).toBeNull();
  });
  it("PUTs the updated product to its own endpoint", async () => {
    renderDrawer({ product: existing() });
    await edit();
    const name = field("Name");
    await userEvent.clear(name);
    await userEvent.type(name, "Renamed");
    await userEvent.click(saveBtn());
    await waitFor(() => expect(form).toHaveBeenCalledTimes(1));
    expect(form.mock.calls[0][0]).toBe("/admin/products/p1");
    expect(form.mock.calls[0][2]).toBe("PUT");
    const fd = fdOf(0);
    expect(fd.get("Name")).toBe("Renamed");
    expect(fd.get("Price")).toBe("12500");
    expect(fd.get("FuelType")).toBe("Gas");
    expect(fd.get("BraaiType")).toBe("Built-in");
    expect(fd.has("ProductType")).toBe(false);
  });
  it("toasts, refreshes and closes after updating", async () => {
    renderDrawer({ product: existing() });
    await edit();
    await userEvent.click(saveBtn());
    expect(await screen.findByText("Product updated.")).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
  it("validates before updating", async () => {
    renderDrawer({ product: existing() });
    await edit();
    await userEvent.clear(field("Name"));
    await userEvent.click(saveBtn());
    expect(await screen.findByText("Product name is required.")).toBeInTheDocument();
    expect(form).not.toHaveBeenCalled();
  });
  it("shows the API error when updating fails", async () => {
    form.mockRejectedValue(new Error("Update rejected"));
    renderDrawer({ product: existing() });
    await edit();
    await userEvent.click(saveBtn());
    expect(await screen.findByText("Update rejected")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
  it("omits OnSpecial when blank and sends it when set", async () => {
    renderDrawer({ product: existing({ onSpecial: 9000 }) });
    await edit();
    expect(field("Special Price (optional)")).toHaveValue(9000);
    await userEvent.click(saveBtn());
    await waitFor(() => expect(form).toHaveBeenCalled());
    expect(fdOf(0).get("OnSpecial")).toBe("9000");
  });
  it("sends fireplace fields for fireplaces", async () => {
    renderDrawer({ product: existing({ productType: "Fireplace", heatOutputKw: 9, fireplaceType: "Insert", fuelType: undefined, braaiType: undefined }) });
    await edit();
    await userEvent.click(saveBtn());
    await waitFor(() => expect(form).toHaveBeenCalled());
    const fd = fdOf(0);
    expect(fd.get("HeatOutputKw")).toBe("9");
    expect(fd.get("FireplaceType")).toBe("Insert");
    expect(fd.has("FuelType")).toBe(false);
  });
  it("appends newly chosen images for admins", async () => {
    renderDrawer({ product: existing({ images: IMAGES }) });
    await edit();
    await userEvent.upload(dropzoneInput(), png("new.png"));
    await userEvent.click(saveBtn());
    await waitFor(() => expect(form).toHaveBeenCalled());
    expect((fdOf(0).getAll("Images") as File[]).map((f) => f.name)).toEqual(["new.png"]);
  });

  describe("managing existing images", () => {
    it("keeps all existing images and the primary by default", async () => {
      renderDrawer({ product: existing({ images: IMAGES }) });
      await edit();
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalled());
      expect(fdOf(0).getAll("ExistingImageIds")).toEqual(["i1", "i2"]);
      expect(fdOf(0).get("PrimaryImageId")).toBe("i1");
    });
    it("lets admins choose a different primary image", async () => {
      renderDrawer({ product: existing({ images: IMAGES }) });
      await edit();
      expect(screen.getAllByTitle("Set as primary")).toHaveLength(1);
      await userEvent.click(screen.getByTitle("Set as primary"));
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalled());
      expect(fdOf(0).get("PrimaryImageId")).toBe("i2");
    });
    it("removes an image from the kept list", async () => {
      renderDrawer({ product: existing({ images: IMAGES }) });
      await edit();
      await userEvent.click(screen.getAllByTitle("Remove image")[1]);
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalled());
      expect(fdOf(0).getAll("ExistingImageIds")).toEqual(["i1"]);
    });
    it("clears the primary when the primary image is removed", async () => {
      renderDrawer({ product: existing({ images: IMAGES }) });
      await edit();
      await userEvent.click(screen.getAllByTitle("Remove image")[0]);
      await userEvent.click(saveBtn());
      await waitFor(() => expect(form).toHaveBeenCalled());
      expect(fdOf(0).getAll("ExistingImageIds")).toEqual(["i2"]);
      expect(fdOf(0).has("PrimaryImageId")).toBe(false);
    });
    it("hides image controls from non-admins", async () => {
      renderDrawer({ product: existing({ images: IMAGES }), isAdmin: false });
      await edit();
      expect(screen.queryByTitle("Remove image")).toBeNull();
      expect(screen.queryByTitle("Set as primary")).toBeNull();
    });
  });
});

describe("deleting", () => {
  it("asks for confirmation and can be cancelled", async () => {
    renderDrawer({ product: existing() });
    await userEvent.click(screen.getByRole("button", { name: "Delete Product" }));
    expect(screen.getByText("Delete this product?")).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole("button", { name: "Cancel" }).pop()!);
    expect(screen.queryByText("Delete this product?")).toBeNull();
    expect(del).not.toHaveBeenCalled();
  });
  it("deletes, toasts, refreshes and closes", async () => {
    renderDrawer({ product: existing() });
    await userEvent.click(screen.getByRole("button", { name: "Delete Product" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(del).toHaveBeenCalledWith("/admin/products/p1"));
    expect(await screen.findByText("Product deleted.")).toBeInTheDocument();
    expect(onChanged).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
  it("is also available while editing", async () => {
    renderDrawer({ product: existing() });
    await userEvent.click(screen.getByRole("button", { name: "Edit Product" }));
    expect(screen.getByRole("button", { name: "Delete Product" })).toBeInTheDocument();
  });
  it("shows the API error and stays open when deleting fails", async () => {
    del.mockRejectedValue(new Error("Product is on a quote"));
    renderDrawer({ product: existing() });
    await userEvent.click(screen.getByRole("button", { name: "Delete Product" }));
    await userEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByText("Product is on a quote")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
