"use client";

import { useMemo, useState } from "react";
import { EllipsisVertical, ImageIcon, Plus } from "lucide-react";
import { api, qs } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLoad } from "@/lib/hooks";
import { fmtMoney } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Button, ErrorNote, PageHeader, Pagination, Pill, Spinner, cn } from "@/components/ui";
import ProductDrawer from "@/components/ProductDrawer";

const PAGE_SIZE = 10;
const TABS = [
  { key: "Braai", label: "Braais" },
  { key: "Fireplace", label: "Fireplaces" },
] as const;

function Thumb({ product, size }: { product: Product; size: number }) {
  const img = (product.images ?? []).find((i) => i.isPrimary) ?? product.images?.[0];
  return (
    <div style={{ width: size, height: size }} className="grid shrink-0 place-items-center overflow-hidden rounded-md bg-card">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.url} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-4 w-4 text-stone-300" />
      )}
    </div>
  );
}

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const { data, loading, error, reload } = useLoad(() => api.get<Product[]>(`/admin/products${qs({ pageNumber: 1, pageSize: 1000 })}`));
  const [tab, setTab] = useState<"Braai" | "Fireplace">("Braai");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const all = useMemo(() => data ?? [], [data]);
  const list = useMemo(() => all.filter((p) => (p.productType ?? "").toLowerCase().startsWith(tab.toLowerCase())), [all, tab]);
  const rows = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = all.find((p) => p.productId === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Product Catalogue"
        subtitle="Manage your inventory of braais and fireplaces."
        action={
          isAdmin ? (
            <Button onClick={() => setCreating(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 flex gap-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={cn(
              "-mb-px border-b-2 px-1 pb-3 text-[11px] font-bold uppercase tracking-wider md:pb-2",
              tab === t.key ? "border-ink text-ink" : "border-transparent text-muted",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <ErrorNote message={error} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                {["Thumbnail", "Product Name", "Brand", "Base Price", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.productId} onClick={() => setOpenId(p.productId)} className="cursor-pointer border-t border-line text-xs hover:bg-card/60">
                  <td className="px-5 py-3">
                    <Thumb product={p} size={36} />
                  </td>
                  <td className="px-5 py-3 text-[13px] font-semibold">{p.name}</td>
                  <td className="px-5 py-3 text-muted">{p.brand || "—"}</td>
                  <td className="px-5 py-3 font-medium">{fmtMoney(p.price)}</td>
                  <td className="px-5 py-3">
                    <Pill tone={p.isVisible ? "dark" : "grey"}>{p.isVisible ? "Active" : "Draft"}</Pill>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    <EllipsisVertical className="h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {rows.length === 0 && (
            <div className="py-12 text-center text-sm text-muted">No {tab === "Braai" ? "braais" : "fireplaces"} yet.</div>
          )}
          <Pagination page={page} pageSize={PAGE_SIZE} total={list.length} noun="products" onChange={setPage} />
        </div>
      )}

      <ProductDrawer
        open={creating || !!selected}
        product={creating ? null : selected}
        defaultType={tab}
        isAdmin={isAdmin}
        onClose={() => {
          setCreating(false);
          setOpenId(null);
        }}
        onChanged={reload}
      />
    </>
  );
}