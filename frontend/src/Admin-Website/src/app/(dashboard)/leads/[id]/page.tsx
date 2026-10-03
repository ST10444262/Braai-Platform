"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, qs } from "@/lib/api";
import { useLoad, useProductNames } from "@/lib/hooks";
import { fullName, requestedProduct, fmtDateTime } from "@/lib/format";
import type { Enquiry } from "@/lib/types";
import { Button, ErrorNote, Spinner, StatusBadge, cn } from "@/components/ui";
import { useToast } from "@/components/ui";

const STATUSES = ["New", "Contacted", "Converted", "Dead"];

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const names = useProductNames();

  const { data, loading, error, reload } = useLoad(
    async () => {
      const res = await api.get<Enquiry[]>(`/admin/enquiries${qs({ enquiryId: id })}`);
      return res[0] ?? null;
    },
    [id],
  );

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Sync selectedStatus with data once loaded
  useMemo(() => {
    if (data && !selectedStatus) {
      setSelectedStatus(data.status);
    }
  }, [data, selectedStatus]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!data) return <ErrorNote message="Lead not found." />;

  async function handleUpdateStatus() {
    if (!selectedStatus || selectedStatus === data?.status) return;
    setBusy(true);
    try {
      await api.put(`/admin/enquiries/${id}/status`, { status: selectedStatus });
      toast("Lead status updated successfully.");
      await reload();
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  }

  const tile = (label: string, value: React.ReactNode) => (
    <div className="rounded-xl border border-line bg-card/60 p-4">
      <div className="text-[9px] font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );

  return (
    <>
      <div className="mb-4 text-[11px] text-muted">
        <Link href="/leads" className="hover:text-ink">
          Lead Management
        </Link>{" "}
        › <span className="text-ink">{fullName(data)}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Lead Details</h1>
        <p className="mt-2 text-sm text-muted">Full enquiry history and contact info.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Main Info Card */}
          <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{fullName(data)}</h2>
                <div className="text-xs text-muted">{data.email}</div>
              </div>
              <StatusBadge status={data.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {tile("Requested Product", requestedProduct(data, names))}
              {tile("Contact Number", data.phone || "Not provided")}
              {tile("Received", timeAgoDisplay(data.createdAt))}
              {tile("Source", data.enquiryType || "Website Quote Form")}
            </div>
            
            {data.message && (
              <div className="mt-4 rounded-xl border border-line bg-card/60 p-4">
                <div className="text-[9px] font-semibold uppercase tracking-wide text-muted">Message</div>
                <div className="mt-1 text-sm text-stone-700 whitespace-pre-wrap">{data.message}</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Update Status Card */}
          <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <div className="mb-4 text-[10px] font-semibold uppercase tracking-wide text-muted">Update Status</div>
            <div className="flex flex-col gap-2">
              {STATUSES.map((s) => {
                const active = selectedStatus === s;
                return (
                  <label
                    key={s}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition",
                      active ? "border-ink bg-stone-50" : "border-line bg-white hover:bg-card",
                    )}
                    onClick={() => setSelectedStatus(s)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("grid h-4 w-4 place-items-center rounded-full border", active ? "border-ink" : "border-line")}>
                        {active && <div className="h-2 w-2 rounded-full bg-ink" />}
                      </div>
                      <span className="text-sm font-semibold">{s}</span>
                    </div>
                    <StatusBadge status={s} />
                  </label>
                );
              })}
            </div>
            <Button
              className="mt-5 w-full bg-ink text-white"
              loading={busy}
              onClick={handleUpdateStatus}
              disabled={selectedStatus === data.status}
            >
              Update Lead Status
            </Button>
          </div>

          {/* Activity Timeline Card */}
          <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <div className="mb-6 text-[10px] font-semibold uppercase tracking-wide text-muted">Activity Timeline</div>
            <div className="relative pl-3">
              <div className="absolute bottom-0 left-[21px] top-2 w-[1px] bg-line" />
              <ul className="space-y-6">
                
                {data.createdAt !== data.updatedAt && (
                   <li className="relative flex gap-4">
                    <div className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-ink outline outline-[3px] outline-white" />
                    <div>
                      <div className="text-sm font-semibold text-ink">Lead status updated to {data.status}</div>
                      <div className="text-[11px] text-muted">{fmtDateTime(data.updatedAt)}</div>
                    </div>
                  </li>
                )}

                <li className="relative flex gap-4">
                  <div className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-ink outline outline-[3px] outline-white" />
                  <div>
                    <div className="text-sm font-semibold text-ink">Enquiry submitted via website</div>
                    <div className="text-[11px] text-muted">{fmtDateTime(data.createdAt)}</div>
                  </div>
                </li>

              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function timeAgoDisplay(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}
//---------------------END OF FILE------------------------------------------------------------------//