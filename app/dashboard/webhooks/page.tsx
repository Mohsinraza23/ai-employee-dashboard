"use client";

import { api } from "@/lib/api";
import { usePoll } from "@/hooks/use-poll";
import { useAction } from "@/hooks/use-action";
import { useAuth } from "@/context/auth-context";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { Webhook, Github, CreditCard, Calendar, Globe, Send } from "lucide-react";
import type { WebhookStats } from "@/types/api";

function statCount(stats: WebhookStats, key: string): number {
  const s = stats as Record<string, unknown>;
  const v = s[key.toLowerCase()] ?? s[key[0].toUpperCase() + key.slice(1)];
  return typeof v === "number" ? v : 0;
}

const PROVIDERS = [
  { label: "GitHub",   key: "github",   icon: Github,       color: "text-slate-300 bg-slate-700/30 border-slate-700/50" },
  { label: "Stripe",   key: "stripe",   icon: CreditCard,   color: "text-violet-300 bg-violet-500/10 border-violet-500/20" },
  { label: "Calendly", key: "calendly", icon: Calendar,     color: "text-blue-300 bg-blue-500/10 border-blue-500/20" },
  { label: "Custom",   key: "custom",   icon: Globe,        color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20" },
] as const;

export default function WebhooksPage() {
  const { isAdmin } = useAuth();

  const { data, loading, error, lastFetch, refresh } = usePoll({
    fetcher:  () => api.webhookStatus(),
    interval: 15_000,
  });

  const webhookTest = useAction(
    () => api.webhookTest(),
    {
      successMsg: res => res.ok ? `Test webhook delivered (${res.status ?? 200})` : "Test sent (check logs)",
      confirm: { title: "Send test webhook?", body: "Sends a POST to localhost:5002/webhooks/custom/test.", severity: "warning", confirmText: "Send Test" },
      onSuccess: () => setTimeout(refresh, 1_500),
    },
  );

  const pm2Status  = data?.pm2?.pm2_status ?? data?.pm2?.status ?? "unknown";
  const stats      = data?.stats ?? {};
  const recentEvts = stats.recent_events ?? [];
  const totalEvts  = PROVIDERS.reduce((s, p) => s + statCount(stats, p.key), 0);

  return (
    <div className="flex flex-col">
      <Topbar onRefresh={refresh} lastRefresh={lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up max-w-3xl">

        <div className="flex items-start justify-between gap-4">
          <PageHeader
            icon={Webhook}
            title="Webhooks"
            accent="violet"
            description="Incoming event streams from GitHub, Stripe, Calendly, and custom sources"
            className="mb-0 flex-1"
          />
          <div className="flex items-center gap-2 mt-1 shrink-0">
            <Badge variant={pm2Status === "online" ? "success" : pm2Status === "stopped" ? "default" : "danger"} dot={pm2Status === "online"}>
              {pm2Status}
            </Badge>
          </div>
        </div>

        {error && <InfoBanner variant="danger">{error}</InfoBanner>}

        {loading && !data && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-violet-400" />
          </div>
        )}

        {data && (
          <>
            {/* Provider stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PROVIDERS.map(({ label, key, icon: Icon, color }) => (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center ${color}`}
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color.split(" ").slice(1).join(" ")}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-white tabular-nums">{statCount(stats, key)}</p>
                  <p className="text-[11px] font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Meta */}
            <Card>
              <CardContent className="py-4 flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-6">
                  <span className="stat-item">
                    <span className="stat-label">Port</span>
                    <span className="stat-value font-mono">{data.port ?? 5002}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">Uptime</span>
                    <span className="stat-value">{data.pm2?.uptime ?? "—"}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">Total Received</span>
                    <span className="stat-value">{totalEvts}</span>
                  </span>
                </div>
                {isAdmin && (
                  <Button
                    variant="secondary" size="sm"
                    loading={webhookTest.loading}
                    onClick={() => webhookTest.run()}
                    className="gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Send Test
                  </Button>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Recent events */}
        <Card glow>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            {recentEvts.length > 0 && (
              <Badge variant="default">{recentEvts.length}</Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {recentEvts.length === 0 ? (
              <div className="empty-state">
                <Webhook className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm text-slate-600">No recent events recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {recentEvts.slice(0, 20).map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <Badge variant="info" className="shrink-0">{ev.source}</Badge>
                    <span className="flex-1 text-sm font-medium text-slate-200 truncate">{ev.event}</span>
                    <span className="shrink-0 text-xs text-slate-600 tabular-nums">{ev.ts}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
