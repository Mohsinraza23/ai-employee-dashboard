"use client";

import { api } from "@/lib/api";
import { usePoll } from "@/hooks/use-poll";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApprovalList } from "@/components/dashboard/approval-list";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function ApprovalsPage() {
  const { data, loading, refresh, lastFetch } = usePoll({
    fetcher:  api.approvals,
    interval: 15_000,
  });

  const items = data?.approvals ?? [];
  const count = items.length;

  const highRisk = items.filter(a => a.risk === "high").length;
  const medRisk  = items.filter(a => a.risk === "medium").length;

  return (
    <div className="flex flex-col">
      <Topbar onRefresh={refresh} refreshing={loading} lastRefresh={lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up">

        <PageHeader
          icon={ShieldAlert}
          title="Approvals"
          accent="amber"
          description="Human-in-the-loop actions awaiting your review"
        >
          {count > 0 && <Badge variant="warning" dot glow>{count} pending</Badge>}
          {count === 0 && data && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              All clear
            </div>
          )}
        </PageHeader>

        {/* Risk summary */}
        {count > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "High Risk",   value: highRisk, variant: "danger"  as const },
              { label: "Medium Risk", value: medRisk,  variant: "warning" as const },
              { label: "Low Risk",    value: count - highRisk - medRisk, variant: "default" as const },
            ].map(({ label, value, variant }) => (
              <div key={label} className="glass rounded-xl px-4 py-3 text-center">
                <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
                <div className="mt-1 flex items-center justify-center">
                  <Badge variant={variant} className="text-[10px]">{label}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        <Card glow>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Pending Actions</CardTitle>
              {count > 0 && <Badge variant="warning">{count}</Badge>}
            </div>
            {loading && !data && <Spinner size="sm" className="text-slate-500" />}
          </CardHeader>
          <CardContent className="p-0">
            {loading && !data ? (
              <div className="flex justify-center py-16">
                <Spinner size="md" className="text-slate-500" />
              </div>
            ) : (
              <ApprovalList items={items} onChanged={refresh} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
