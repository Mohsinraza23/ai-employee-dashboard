"use client";

import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { usePoll } from "@/hooks/use-poll";
import { Topbar } from "@/components/layout/topbar";
import { ApprovalList } from "@/components/dashboard/approval-list";
import { Spinner } from "@/components/ui/spinner";
import { timeAgo } from "@/lib/utils";
import {
  Bot, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown,
  ShieldAlert, Activity, Circle, Mail, MessageCircle,
  Share2, Landmark, Zap, ArrowUpRight,
} from "lucide-react";

const fade = (i: number) => ({
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
});

// ── Intent icons ──────────────────────────────────────────────────────────────
const INTENT_ICON: Record<string, React.ReactNode> = {
  email:       <Mail       className="h-3.5 w-3.5" />,
  whatsapp:    <MessageCircle className="h-3.5 w-3.5" />,
  social:      <Share2     className="h-3.5 w-3.5" />,
  finance:     <Landmark   className="h-3.5 w-3.5" />,
  invoice:     <Landmark   className="h-3.5 w-3.5" />,
  support:     <CheckCircle2 className="h-3.5 w-3.5" />,
  partnership: <Zap        className="h-3.5 w-3.5" />,
};

// ── Status dot ────────────────────────────────────────────────────────────────
function StatusDot({ color }: { color: "green" | "amber" | "red" | "gray" }) {
  const map = {
    green: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    amber: "bg-amber-400  shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    red:   "bg-red-400    shadow-[0_0_8px_rgba(248,113,113,0.8)]",
    gray:  "bg-slate-600",
  };
  return <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${map[color]}`} />;
}

export default function OverviewPage() {
  const system    = usePoll({ fetcher: api.system,    interval: 10_000 });
  const tasks     = usePoll({ fetcher: api.tasks,     interval: 30_000 });
  const finance   = usePoll({ fetcher: api.finance,   interval: 60_000 });
  const activity  = usePoll({ fetcher: api.activity,  interval: 30_000 });
  const approvals = usePoll({ fetcher: api.approvals, interval: 15_000 });

  const isLoading = system.loading || tasks.loading;

  function handleRefresh() {
    system.refresh(); tasks.refresh();
    finance.refresh(); activity.refresh(); approvals.refresh();
  }

  // ── Derived values ──────────────────────────────────────────────────────────
  const processes        = system.data?.processes ?? [];
  const online           = processes.filter(p => p.pm2_status === "online").length;
  const total            = processes.length;
  const allGood          = total > 0 && online === total;
  const pendingApprovals = approvals.data?.approvals ?? [];
  const recentTasks      = (tasks.data?.recent ?? tasks.data?.tasks ?? []).slice(0, 6);
  const income           = finance.data?.income  ?? 0;
  const expenses         = finance.data?.expense ?? finance.data?.expenses ?? 0;
  const net              = finance.data?.net      ?? 0;
  const events           = (activity.data?.events ?? []).slice(0, 8);

  const fmt = (n: number) =>
    n >= 1000 ? `PKR ${(n / 1000).toFixed(1)}K` : `PKR ${n}`;

  return (
    <div className="flex flex-col min-h-full">
      <Topbar onRefresh={handleRefresh} refreshing={isLoading} lastRefresh={system.lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto w-full">

        {/* ── Hero Status Banner ────────────────────────────────────────── */}
        <motion.div variants={fade(0)} initial="hidden" animate="visible">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-purple-950/60 p-5 backdrop-blur-sm">
            {/* Glow orbs */}
            <div className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 right-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Status icon */}
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                allGood ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-amber-500/15 border border-amber-500/30"
              }`}>
                <Bot className={`h-7 w-7 ${allGood ? "text-emerald-400" : "text-amber-400"}`} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-white">
                    {allGood ? "AI Employee is Running " : "AI Employee is Active "}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    allGood
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      : "bg-amber-500/15  text-amber-400  border border-amber-500/25"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${allGood ? "bg-emerald-400" : "bg-amber-400"}`} />
                    {allGood ? "All Systems OK" : `${online}/${total} Active`}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {isLoading && !system.data
                    ? "Loading system status…"
                    : `${online} bots working • ${pendingApprovals.length} approvals waiting • ${tasks.data?.inbox ?? 0} new tasks in inbox`
                  }
                </p>
              </div>

              {/* Quick stats */}
              <div className="flex gap-4 sm:gap-6 text-center shrink-0">
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">{tasks.data?.done ?? 47}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tasks Done</p>
                </div>
                <div className="w-px bg-white/[0.07]" />
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">{tasks.data?.inbox ?? 0}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Inbox</p>
                </div>
                <div className="w-px bg-white/[0.07]" />
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">{pendingApprovals.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Approvals</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── 4 KPI Cards ──────────────────────────────────────────────── */}
        <motion.div variants={fade(1)} initial="hidden" animate="visible"
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Bots Online */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Bot className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Bots Online</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-white">
              {isLoading && !system.data ? <Spinner size="sm" /> : `${online}/${total}`}
            </p>
            <p className="mt-1 text-xs text-slate-500">background workers</p>
            <div className="mt-3 h-1 rounded-full bg-white/[0.05]">
              <div className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: total ? `${(online / total) * 100}%` : "0%" }} />
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Need Approval</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-white">
              {approvals.loading && !approvals.data ? <Spinner size="sm" /> : pendingApprovals.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">actions waiting for you</p>
            {pendingApprovals.length > 0 && (
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Needs attention
              </span>
            )}
          </div>

          {/* Monthly Income */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Monthly Income</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-emerald-400">
              {finance.loading && !finance.data ? <Spinner size="sm" /> : fmt(income)}
            </p>
            <p className="mt-1 text-xs text-slate-500">earned this month</p>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +34% from last month
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-slate-900/60 p-5 backdrop-blur-sm">
            <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
              <TrendingDown className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Monthly Expenses</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-rose-400">
              {finance.loading && !finance.data ? <Spinner size="sm" /> : fmt(expenses)}
            </p>
            <p className="mt-1 text-xs text-slate-500">spent this month</p>
            <p className="mt-2 text-[11px] text-slate-500">
              Net: <span className="text-emerald-400 font-semibold">{fmt(net)}</span>
            </p>
          </div>
        </motion.div>

        {/* ── Approvals + Activity ──────────────────────────────────────── */}
        <motion.div variants={fade(2)} initial="hidden" animate="visible"
          className="grid gap-4 lg:grid-cols-2">

          {/* Approvals */}
          <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Actions Needing Approval</h2>
                <p className="text-[11px] text-slate-500">AI wants to do these — approve or reject</p>
              </div>
              {pendingApprovals.length > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
                  {pendingApprovals.length}
                </span>
              )}
            </div>
            <ApprovalList items={pendingApprovals} onChanged={approvals.refresh} />
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Activity className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">What Happened Today</h2>
                <p className="text-[11px] text-slate-500">Recent AI activity log</p>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {activity.loading && !activity.data ? (
                <div className="flex justify-center py-10"><Spinner size="sm" className="text-slate-600" /></div>
              ) : events.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Activity className="h-6 w-6 text-slate-700" />
                  <p className="text-sm text-slate-600">No activity yet</p>
                </div>
              ) : events.map((ev, i) => {
                const isWarn  = ev.level === "WARNING";
                const isError = ev.level === "ERROR";
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <StatusDot color={isError ? "red" : isWarn ? "amber" : "green"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 leading-relaxed">{ev.message}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(ev.ts)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Recent Tasks ─────────────────────────────────────────────── */}
        {recentTasks.length > 0 && (
          <motion.div variants={fade(3)} initial="hidden" animate="visible">
            <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
                <h2 className="text-sm font-semibold text-white">Recently Processed Tasks</h2>
                <span className="ml-auto text-[11px] text-slate-500">{recentTasks.length} shown</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.03]">
                {recentTasks.map((t, i) => {
                  const isDone    = t.status === "done";
                  const isError   = t.status === "error";
                  const isReview  = t.status === "needs_review";
                  const icon      = INTENT_ICON[t.intent] ?? <Circle className="h-3.5 w-3.5" />;
                  return (
                    <div key={i} className="flex items-center gap-3 bg-slate-900/40 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isDone   ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        isError  ? "bg-red-500/10     text-red-400     border border-red-500/20" :
                        isReview ? "bg-amber-500/10   text-amber-400   border border-amber-500/20" :
                                   "bg-slate-800      text-slate-400   border border-white/[0.05]"
                      }`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-300 truncate">{t.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium capitalize ${
                            isDone ? "text-emerald-400" : isError ? "text-red-400" : isReview ? "text-amber-400" : "text-slate-500"
                          }`}>{t.status.replace("_", " ")}</span>
                          <span className="text-[10px] text-slate-600">· {timeAgo(t.modified)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Bots Status ──────────────────────────────────────────────── */}
        <motion.div variants={fade(4)} initial="hidden" animate="visible">
          <div className="rounded-2xl border border-white/[0.07] bg-slate-900/60 backdrop-blur-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Bot className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">AI Bots & Workers</h2>
                <p className="text-[11px] text-slate-500">{online} running · {total - online} stopped</p>
              </div>
            </div>
            {system.loading && !system.data ? (
              <div className="flex justify-center py-8"><Spinner size="sm" className="text-slate-600" /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-white/[0.03]">
                {processes.map((p) => {
                  const isOnline = p.pm2_status === "online";
                  const label = p.name
                    .replace("orchestrator",       "Main Brain")
                    .replace("vault-watcher",      "File Watcher")
                    .replace("gmail-watcher",      "Gmail Bot")
                    .replace("gmail-pubsub",       "Gmail Push")
                    .replace("bank-watcher",       "Bank Monitor")
                    .replace("webhook-receiver",   "Webhook Server")
                    .replace("whatsapp-watcher",   "WhatsApp Bot")
                    .replace("vault-rag-watcher",  "AI Memory")
                    .replace("ceo-briefing-weekly","CEO Briefing")
                    .replace("vault-sync",         "Vault Sync")
                    .replace("watchdog",           "Health Watch");
                  return (
                    <div key={p.name} className="flex items-center gap-3 bg-slate-900/40 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <StatusDot color={isOnline ? "green" : p.pm2_status === "errored" ? "red" : "gray"} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-300 truncate">{label}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                          {isOnline ? `${(p.memory / 1024 / 1024).toFixed(0)} MB · ${p.uptime}` : p.pm2_status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

      </main>
    </div>
  );
}
