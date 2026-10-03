"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import type { Product, ProductImage } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { Button, Chips, ConfirmDialog, Drawer, Dropzone, Field, Pill, TextInput, cn, inputCls, useToast } from "./ui";

type Mode = "view" | "edit" | "create";
const FUELS = ["Gas", "Charcoal", "Wood"];
const BRAAI_TYPES = ["Built-in", "Freestanding", "Insert"];

const empty = {
  name: "",
  category: "",
  brand: "",
  productType: "Braai",
  price: "",
  onSpecial: "",
  description: "",
  isVisible: true,
  isImported: false,
  isCustomisable: false,
  fuelType: "Gas",
  braaiType: "",
  heatOutputKw: "",
  fireplaceType: "",
};

export default function ProductDrawer({
  open,
  product,
  defaultType,
  isAdmin,
  onClose,
  onChanged,
}: {
  open: boolean;
  product: Product | null;
  defaultType: "Braai" | "Fireplace";
  isAdmin: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>("view");
  const [f, setF] = useState(empty);
  const [files, setFiles] = useState<File[]>([]);
  const [keptImages, setKeptImages] = useState<ProductImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFiles([]);
    if (!product) {
      setMode("create");
      setF({ ...empty, productType: defaultType, fuelType: defaultType === "Braai" ? "Gas" : "" });
      setKeptImages([]);
      return;
    }
    setMode("view");
    setF({
      name: product.name,
      category: product.category,
      brand: product.brand,
      productType: product.productType || defaultType,
      price: String(product.price),
      onSpecial: product.onSpecial != null ? String(product.onSpecial) : "",
      description: product.description,
      isVisible: product.isVisible,
      isImported: product.isImported,
      isCustomisable: product.isCustomisable,
      fuelType: product.fuelType ?? "",
      braaiType: product.braaiType ?? "",
      heatOutputKw: product.heatOutputKw != null ? String(product.heatOutputKw) : "",
      fireplaceType: product.fireplaceType ?? "",
    });
    setKeptImages(product.images ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.productId, defaultType, product?.images]);

  const set = <K extends keyof typeof empty>(k: K, v: (typeof empty)[K]) => setF((p) => ({ ...p, [k]: v }));
  const readOnly = mode === "view";
  const isBraai = f.productType.toLowerCase().startsWith("braai");
  const images = mode === "view" ? (product?.images ?? []) : keptImages;

  function addFiles(list: File[]) {
    const ok = list.filter((x) => x.size <= 5 * 1024 * 1024);
    if (ok.length < list.length) toast("Images over 5 MB were skipped.", "err");
    setFiles((cur) => [...cur, ...ok]);
  }

  async function save() {
    const price = Number(f.price);
    if (!f.name.trim()) return toast("Product name is required.", "err");
    if (Number.isNaN(price) || price < 0) return toast("Enter a valid price.", "err");
    setBusy(true);
    try {
      if (mode === "create") {
        const fd = new FormData();
        fd.append("Name", f.name.trim());
        fd.append("Category", isBraai ? f.braaiType : f.fireplaceType);
        fd.append("ProductType", f.productType);
        fd.append("Brand", f.brand.trim());
        fd.append("IsImported", String(f.isImported));
        fd.append("IsCustomisable", String(f.isCustomisable));
        fd.append("Price", String(price));
        if (f.onSpecial) fd.append("OnSpecial", f.onSpecial);
        fd.append("Description", f.description);
        fd.append("IsVisible", String(f.isVisible));
        if (isBraai) {
          fd.append("FuelType", f.fuelType);
          fd.append("BraaiType", f.braaiType);
        } else {
          if (f.heatOutputKw) fd.append("HeatOutputKw", f.heatOutputKw);
          fd.append("FireplaceType", f.fireplaceType);
        }
        files.forEach((file) => fd.append("Images", file));
        await api.form("/admin/products", fd);
        toast("Product created.");
      } else if (product) {
        const fd = new FormData();
        fd.append("Name", f.name.trim());
        fd.append("Category", isBraai ? f.braaiType : f.fireplaceType);
        fd.append("Brand", f.brand.trim());
        fd.append("IsImported", String(f.isImported));
        fd.append("IsCustomisable", String(f.isCustomisable));
        fd.append("Price", String(price));
        fd.append("Description", f.description);
        if (f.onSpecial) fd.append("OnSpecial", f.onSpecial);
        fd.append("IsVisible", String(f.isVisible));
        
        if (isBraai) {
          if (f.fuelType) fd.append("FuelType", f.fuelType);
          if (f.braaiType) fd.append("BraaiType", f.braaiType);
        } else {
          if (f.heatOutputKw) fd.append("HeatOutputKw", f.heatOutputKw);
          if (f.fireplaceType) fd.append("FireplaceType", f.fireplaceType);
        }

        // Preserve existing images
        keptImages.forEach((img) => {
          fd.append("ExistingImageIds", img.imageId);
        });

        // Append new images
        if (files.length && isAdmin) {
          files.forEach((file) => fd.append("Images", file));
        }

        await api.form(`/admin/products/${product.productId}`, fd, "PUT");
        toast("Product updated.");
      }
      onChanged();
      onClose();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!product) return;
    setBusy(true);
    try {
      await api.del(`/admin/products/${product.productId}`);
      toast("Product deleted.");
      setConfirmDelete(false);
      onChanged();
      onClose();
    } catch (e) {
      toast((e as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  async function imageAction(fn: () => Promise<unknown>) {
    try {
      await fn();
      onChanged();
    } catch (e) {
      toast((e as Error).message, "err");
    }
  }

  const title = mode === "create" ? "Add New Product" : mode === "edit" ? "Edit Product" : "Product Details";

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title={title}
        footer={
          mode === "view" ? (
            <>
              {isAdmin && (
                <Button variant="danger" className="mr-auto" onClick={() => setConfirmDelete(true)}>
                  Delete Product
                </Button>
              )}
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={() => setMode("edit")}>Edit Product</Button>
            </>
          ) : (
            <>
              {mode === "edit" && isAdmin && (
                <Button variant="danger" className="mr-auto" onClick={() => setConfirmDelete(true)}>
                  Delete Product
                </Button>
              )}
              <Button variant="secondary" onClick={() => (mode === "edit" ? setMode("view") : onClose())}>
                Cancel
              </Button>
              <Button loading={busy} onClick={save}>
                Save Product
              </Button>
            </>
          )
        }
      >
        <Field label="Product Category">
          <select
            className={inputCls}
            disabled={mode !== "create"}
            value={f.productType}
            onChange={(e) => {
              set("productType", e.target.value);
              set("fuelType", e.target.value === "Braai" ? "Gas" : "");
            }}
          >
            <option value="Braai">Braais</option>
            <option value="Fireplace">Fireplaces</option>
          </select>
        </Field>

        {images.length > 0 && (
          <div className="grid h-44 place-items-center overflow-hidden rounded-xl bg-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={(images.find((i) => i.isPrimary) ?? images[0]).url} alt={f.name} className="h-full w-full object-cover" />
          </div>
        )}

        <Field label="Name">
          <TextInput disabled={readOnly} placeholder="Enter product name" value={f.name} onChange={(e) => set("name", e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Base Price (ZAR)">
            <TextInput
              type="number"
              min={0}
              disabled={readOnly || (mode === "edit" && !isAdmin)}
              placeholder="0.00"
              value={f.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </Field>
          <Field label="Special Price (optional)">
            <TextInput
              type="number"
              min={0}
              disabled={readOnly || (mode === "edit" && !isAdmin)}
              placeholder="—"
              value={f.onSpecial}
              onChange={(e) => set("onSpecial", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Brand">
          <TextInput disabled={readOnly} value={f.brand} onChange={(e) => set("brand", e.target.value)} />
        </Field>

        {isBraai ? (
          <>
            <Field label="Fuel Type">
              <Chips options={FUELS} value={f.fuelType} onChange={(v) => set("fuelType", v)} disabled={readOnly} />
            </Field>
            <Field label="Braai Type">
              <Chips options={BRAAI_TYPES} value={f.braaiType} onChange={(v) => set("braaiType", v)} disabled={readOnly} />
            </Field>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Heat Output (kW)">
              <TextInput type="number" min={0} disabled={readOnly} value={f.heatOutputKw} onChange={(e) => set("heatOutputKw", e.target.value)} />
            </Field>
            <Field label="Fireplace Type">
              <TextInput disabled={readOnly} value={f.fireplaceType} onChange={(e) => set("fireplaceType", e.target.value)} />
            </Field>
          </div>
        )}

        <Field label="Description">
          <textarea
            rows={4}
            disabled={readOnly}
            className={inputCls}
            placeholder="Brief product description..."
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Field label="Status">
            <Chips
              options={["Active", "Draft"]}
              value={f.isVisible ? "Active" : "Draft"}
              onChange={(v) => set("isVisible", v === "Active")}
              disabled={readOnly}
            />
          </Field>
          <label className="flex items-center gap-2 pt-5 text-xs">
            <input type="checkbox" disabled={readOnly} checked={f.isImported} onChange={(e) => set("isImported", e.target.checked)} /> Imported
          </label>
          <label className="flex items-center gap-2 pt-5 text-xs">
            <input type="checkbox" disabled={readOnly} checked={f.isCustomisable} onChange={(e) => set("isCustomisable", e.target.checked)} /> Customisable
          </label>
        </div>

        <div className="block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">Product Images</span>
          {images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div key={img.imageId} className="group relative aspect-square overflow-hidden rounded-lg bg-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  {img.isPrimary && (
                    <span className="absolute left-1 top-1">
                      <Pill tone="dark">Primary</Pill>
                    </span>
                  )}
                  {mode === "edit" && isAdmin && (
                    <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/50 p-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        title="Remove image"
                        type="button"
                        onClick={() => setKeptImages((c) => c.filter((x) => x.imageId !== img.imageId))}
                        className="rounded bg-white p-1 text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {!readOnly && isAdmin && (
            <>
              <Dropzone title="Click to upload or drag and drop" hint="PNG, JPG up to 5MB" accept=".png,.jpg,.jpeg,.webp" onFiles={addFiles} />
              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((file, i) => (
                    <li key={i} className={cn("flex items-center justify-between rounded-lg bg-card px-3 py-1.5 text-xs")}>
                      <span className="truncate">{file.name}</span>
                      <button onClick={() => setFiles((c) => c.filter((_, j) => j !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {product && mode !== "create" && (
          <div className="rounded-xl bg-card p-4 text-xs">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">Product Info</div>
            {[
              ["Status", product.isVisible ? "Active" : "Draft"],
              ["Date Added", fmtDate(product.createdAt)],
              ["Last Updated", fmtDate(product.updatedAt)],
              ["Category", product.productType],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1">
                <span className="text-muted">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this product?"
        message="This permanently removes the product, its images and its listing on the public website."
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
