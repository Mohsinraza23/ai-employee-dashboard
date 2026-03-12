"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { usePoll } from "@/hooks/use-poll";
import { useAction } from "@/hooks/use-action";
import { WARN } from "@/lib/warnings";
import { useDryRun } from "@/context/dry-run-context";
import { useAuth } from "@/context/auth-context";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { MessageCircle, Send, QrCode, RotateCcw, Wifi, WifiOff } from "lucide-react";

export default function WhatsAppPage() {
  const { isAdmin }           = useAuth();
  const { isSafe, demoMode }  = useDryRun();

  const [phone,      setPhone]      = useState("");
  const [message,    setMessage]    = useState("");
  const [pairOutput, setPairOutput] = useState<string | null>(null);

  const { data, loading, error, lastFetch, refresh } = usePoll({
    fetcher:  () => api.whatsappStatus(),
    interval: 15_000,
  });

  const restartWA = useAction(
    () => api.restartService("whatsapp-watcher"),
    { successMsg: "WhatsApp watcher restarted", confirm: WARN.restartService("whatsapp-watcher"), onSuccess: () => setTimeout(refresh, 3_000) },
  );

  const pairWA = useAction(
    () => api.whatsappPair(),
    {
      successMsg: res => res.message ?? "Pairing code generated",
      onSuccess:  res => {
        const stdout = (res as { stdout?: string }).stdout ?? res.message ?? "";
        if (stdout) setPairOutput(stdout);
        setTimeout(refresh, 3_000);
      },
    },
  );

  const sendMessage = useAction(
    () => api.whatsappMessage(phone, message),
    {
      successMsg: isSafe ? "Message simulated (safe mode)" : "WhatsApp message queued",
      confirm:    isSafe
        ? { title: "Simulate message?", body: `${demoMode ? "Demo" : "Dry Run"} mode — nothing will be sent.`, severity: "warning", confirmText: "Simulate" }
        : WARN.whatsappSend(phone),
    },
  );

  const pm2      = data?.pm2;
  const isValid  = phone.trim() && message.trim();
  const connected = data?.connected ?? false;

  const stats = [
    { label: "Status",   value: pm2 ? (pm2.pm2_status ?? pm2.status) : "—" },
    { label: "Restarts", value: pm2?.restarts ?? "—" },
    { label: "Uptime",   value: pm2?.uptime ?? "—" },
    { label: "Memory",   value: pm2?.memory ? `${Math.round(pm2.memory / 1024 / 1024)} MB` : "—" },
  ];

  return (
    <div className="flex flex-col">
      <Topbar onRefresh={refresh} lastRefresh={lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up max-w-2xl">

        <PageHeader
          icon={MessageCircle}
          title="WhatsApp"
          accent="emerald"
          description="Monitor the Baileys-based WhatsApp automation daemon"
        >
          {data && (
            <Badge variant={connected ? "success" : "danger"} dot glow>
              {connected ? "Connected" : "Disconnected"}
            </Badge>
          )}
        </PageHeader>

        {error && <InfoBanner variant="danger">{error}</InfoBanner>}
        {isSafe && (
          <InfoBanner variant="info">
            <strong>{demoMode ? "Demo Mode" : "Dry Run"}</strong> — messages will be simulated.
          </InfoBanner>
        )}

        {loading && !data && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-emerald-400" />
          </div>
        )}

        {data && (
          <Card glow>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  connected
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}>
                  {connected
                    ? <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                    : <WifiOff className="h-3.5 w-3.5 text-red-400" />}
                </div>
                <CardTitle>Connection Status</CardTitle>
              </div>
              <Badge variant={connected ? "success" : "danger"} dot>
                {connected ? "Online" : "Offline"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map(s => (
                  <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <p className="stat-label">{s.label}</p>
                    <p className="stat-value mt-1">{String(s.value)}</p>
                  </div>
                ))}
              </div>

              {/* Pairing output */}
              {pairOutput && (
                <div className="code-block text-emerald-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {pairOutput}
                </div>
              )}

              {isAdmin && (
                <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                  <Button variant="secondary" size="sm" loading={pairWA.loading} onClick={() => pairWA.run()} className="gap-1.5">
                    <QrCode className="h-3.5 w-3.5" /> Pair Device
                  </Button>
                  <Button variant="ghost" size="sm" loading={restartWA.loading} onClick={() => restartWA.run()} className="gap-1.5 text-slate-500 hover:text-slate-200">
                    <RotateCcw className="h-3.5 w-3.5" /> Restart Watcher
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Send message */}
        <Card glow>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Send className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <CardTitle>Send Message</CardTitle>
            </div>
            {isSafe && <Badge variant="info">{demoMode ? "Demo" : "Dry Run"}</Badge>}
            {!isSafe && isAdmin && <Badge variant="danger" dot>LIVE</Badge>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="form-label">Phone (international format)</label>
              <Input type="tel" placeholder="+1234567890" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="form-label">Message</label>
              <Textarea rows={4} placeholder="Your message…" value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <div className="flex items-center gap-3 pt-1 border-t border-white/[0.06]">
              <Button
                variant={isAdmin && !isSafe ? "danger" : "gradient"}
                loading={sendMessage.loading}
                disabled={!isValid || !isAdmin}
                title={!isAdmin ? "Admin access required" : undefined}
                onClick={() => sendMessage.run()}
                className="gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                {isSafe ? "Send (Simulated)" : "Send Message"}
              </Button>
              {!isAdmin && (
                <p className="text-xs text-slate-600">Admin access required</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
