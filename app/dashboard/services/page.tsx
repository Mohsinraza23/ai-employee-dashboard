"use client";

import { api } from "@/lib/api";
import { usePoll } from "@/hooks/use-poll";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ServiceGrid } from "@/components/dashboard/service-grid";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { Badge } from "@/components/ui/badge";
import { Cpu, ShieldCheck, Zap } from "lucide-react";

export default function ServicesPage() {
  const { data, loading, refresh, lastFetch } = usePoll({
    fetcher:  api.system,
    interval: 10_000,
  });

  const processes  = data?.processes ?? null;
  const online     = processes?.filter(p => p.pm2_status === "online").length ?? 0;
  const total      = processes?.length ?? 0;
  const allHealthy = total > 0 && online === total;

  return (
    <div className="flex flex-col">
      <Topbar onRefresh={refresh} refreshing={loading} lastRefresh={lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up">

        <div className="flex items-start justify-between gap-4">
          <PageHeader
            icon={Cpu}
            title="PM2 Services"
            accent="indigo"
            description="Process management — monitor and restart background daemons"
            className="mb-0 flex-1"
          />
          {processes && (
            <div className="flex items-center gap-2 mt-1 shrink-0">
              <Badge variant={allHealthy ? "success" : online === 0 ? "danger" : "warning"} dot glow>
                {online} / {total} online
              </Badge>
            </div>
          )}
        </div>

        {/* Mode banner */}
        {data && (
          <InfoBanner variant={data.dry_run ? "info" : "danger"} icon={data.dry_run ? ShieldCheck : Zap}>
            <strong>{data.dry_run ? "Dry Run mode" : "Live mode"}</strong>
            {" — "}
            {data.dry_run
              ? "No real actions will be sent. Services restart normally."
              : "Real actions are enabled. Service restarts affect live systems."}
          </InfoBanner>
        )}

        <Card glow>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <CardTitle>All Processes</CardTitle>
            </div>
            {loading && !data && <Spinner size="sm" className="text-slate-500" />}
          </CardHeader>
          <CardContent>
            <ServiceGrid processes={processes} loading={loading} onRefreshed={refresh} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
