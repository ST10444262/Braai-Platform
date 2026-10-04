"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EllipsisVertical, Flame, House } from "lucide-react";
import { api } from "@/lib/api";
import { useLoad, useProductNames } from "@/lib/hooks";
import { fullName, requestedProduct, timeAgo } from "@/lib/format";
import type { Overview } from "@/lib/types";
import { Card, ErrorNote, PageHeader, Spinner, StatusBadge, cn } from "@/components/ui";

const HEALTH: [keyof NonNullable<Overview["systemHealth"]>, string][] = [
  ["apiConnection", "API Connection"],
  ["database", "Database"],
  ["redisCache", "Redis Cache"],
  ["storageService", "Storage Service"],
];

export default function OverviewPage() {
  const router = useRouter();
  const names = useProductNames();
  const { data, loading, error } = useLoad(() => api.get<Overview>("/admin/overview"));

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorNote message={error ?? "Could not load the overview."} />;

  const p = data.leadPipeline;
  const total = Math.max(1, p.new + p.contacted + p.converted + p.dead);
  const tiles = [
    { label: "New", value: p.new, bar: "bg-orange-500" },
    { label: "Contacted", value: p.contacted, bar: "bg-ink" },
    { label: "Converted", value: p.converted, bar: "bg-violet-600" },
    { label: "Dead", value: p.dead, bar: "bg-stone-400" },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        subtitle="Monitor system health, active catalogue items, and real-time lead acquisition metrics across the platform."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold">Lead Pipeline</h2>
          <p className="text-[11px] font-medium text-violet-600">{p.conversionRate}% Conversion Rate</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-2xl bg-white/80 p-4">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted">{t.label}</div>
                <div className="mt-1 text-3xl font-bold">{t.value}</div>
                <div className="mt-3 h-1 rounded-full bg-stone-200">
                  <div className={cn("h-1 rounded-full", t.bar)} style={{ width: `${(t.value / total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Catalogue Status</h2>
          <div className="mt-5 space-y-3">
            {[
              { label: "Total Braais", value: data.catalogueStatus.totalBraais, icon: Flame },
              { label: "Total Fireplaces", value: data.catalogueStatus.totalFireplaces, icon: House },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3.5">
                <div className="flex items-center gap-3 text-xs font-medium">
                  <r.icon className="h-4 w-4 text-muted" />
                  {r.label}
                </div>
                <div className="text-lg font-semibold">{r.value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className={cn("min-w-0 bg-white", data.systemHealth ? "lg:col-span-2" : "lg:col-span-3")}>
          <h2 className="text-lg font-semibold">Recent Quote Requests</h2>
          <div className="overflow-x-auto">
          <table className="mt-4 w-full min-w-[560px] text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted">
                <th className="py-2 font-medium">Customer Name</th>
                <th className="py-2 font-medium">Requested Product</th>
                <th className="py-2 font-medium">Received</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {data.recentQuoteRequests.map((e) => (
                <tr
                  key={e.enquiryId}
                  onClick={() => router.push(`/leads/${e.enquiryId}`)}
                  className="cursor-pointer border-t border-line text-xs hover:bg-card"
                >
                  <td className="py-3 font-semibold">{fullName(e)}</td>
                  <td className="py-3 text-muted">{requestedProduct(e, names)}</td>
                  <td className="py-3 text-muted">{timeAgo(e.createdAt)}</td>
                  <td className="py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="py-3 text-right text-muted">
                    <EllipsisVertical className="ml-auto h-4 w-4" />
                  </td>
                </tr>
              ))}
              {data.recentQuoteRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-muted">
                    No quote requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          <Link href="/leads" className="mt-3 inline-block text-xs font-medium text-muted hover:text-ink">
            View all leads →
          </Link>
        </Card>

        {data.systemHealth && (
          <Card>
            <h2 className="text-lg font-semibold">System Health</h2>
            <div className="mt-5 space-y-2.5">
              {HEALTH.map(([key, label]) => {
                const v = data.systemHealth![key];
                const ok = v === "Operational" || v === "Stable";
                return (
                  <div key={key} className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-xs">
                    <span className="font-medium">{label}</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted">
                      <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-red-500")} />
                      {v}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}