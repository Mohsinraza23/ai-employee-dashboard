"use client";

import { usePathname } from "next/navigation";
import { RefreshCw, Bell, Activity, Menu } from "lucide-react";
import { useDryRun } from "@/context/dry-run-context";
import { useAuth } from "@/context/auth-context";
import { useMobileMenu } from "@/app/dashboard/layout";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PAGES: Record<string, { title: string; sub: string }> = {
  "/dashboard/overview":  { title: "Overview",       sub: "System health & live metrics" },
  "/dashboard/approvals": { title: "Approvals",      sub: "Pending human-in-the-loop actions" },
  "/dashboard/logs":      { title: "Live Logs",      sub: "Real-time action stream" },
  "/dashboard/services":  { title: "PM2 Services",   sub: "Process management" },
  "/dashboard/finance":   { title: "Finance",        sub: "Revenue & expense tracking" },
  "/dashboard/email":     { title: "Email System",   sub: "Inbox automation" },
  "/dashboard/social":    { title: "Social Media",   sub: "LinkedIn · Twitter · Facebook" },
  "/dashboard/whatsapp":  { title: "WhatsApp",       sub: "Messaging automation" },
  "/dashboard/bank":      { title: "Bank & Finance", sub: "CSV analysis & anomaly detection" },
  "/dashboard/briefing":  { title: "CEO Briefing",   sub: "Weekly executive summary" },
  "/dashboard/rag":       { title: "AI Memory",      sub: "Knowledge base & semantic search" },
  "/dashboard/webhooks":  { title: "Webhooks",       sub: "Incoming event streams" },
};

interface TopbarProps {
  onRefresh?:    () => void;
  refreshing?:   boolean;
  lastRefresh?:  Date | null;
  onMenuToggle?: () => void;
  children?:     React.ReactNode;
}

export function Topbar({ onRefresh, refreshing, lastRefresh, onMenuToggle, children }: TopbarProps) {
  const pathname    = usePathname();
  const page        = PAGES[pathname] ?? { title: "Dashboard", sub: "" };
  const { isDryRun, demoMode, toggleDemoMode } = useDryRun();
  const { username } = useAuth();
  const mobileMenu  = useMobileMenu();
  const menuToggle  = onMenuToggle ?? mobileMenu ?? undefined;

  const mode: "demo" | "dry" | "live" =
    demoMode ? "demo" : isDryRun ? "dry" : "live";

  const pill = {
    demo: { label: "Demo",    dot: "#818CF8", bg: "rgba(99,102,241,0.10)",   border: "rgba(99,102,241,0.22)",  text: "#a5b4fc" },
    dry:  { label: "Dry Run", dot: "#38BDF8", bg: "rgba(14,165,233,0.10)",   border: "rgba(14,165,233,0.22)",  text: "#7dd3fc" },
    live: { label: "Live",    dot: "#34D399", bg: "rgba(16,185,129,0.10)",   border: "rgba(16,185,129,0.22)",  text: "#6ee7b7" },
  }[mode];

  return (
    <header
      className="sticky top-0 z-30 flex h-[60px] items-center gap-3 px-4 sm:px-6 border-b border-white/[0.06]"
      style={{
        background: "rgba(4,6,20,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* Mobile menu toggle */}
      {menuToggle && (
        <button
          onClick={menuToggle}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}

      {/* Page title */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.22 }}
        className="flex-1 min-w-0"
      >
        <h1 className="text-[15px] font-bold text-slate-100 leading-none truncate">{page.title}</h1>
        {page.sub && (
          <p className="mt-0.5 text-[11px] text-slate-600 leading-none hidden sm:block">{page.sub}</p>
        )}
      </motion.div>

      <div className="flex items-center gap-1.5">
        {/* Mode pill — click to toggle demo */}
        <button
          onClick={toggleDemoMode}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold tracking-wide transition-all hover:opacity-80 active:scale-95"
          style={{ background: pill.bg, border: `1px solid ${pill.border}`, color: pill.text }}
        >
          {mode === "live" ? (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: pill.dot }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: pill.dot }} />
            </span>
          ) : (
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: pill.dot }} />
          )}
          <span className="hidden sm:inline">{pill.label}</span>
        </button>

        {/* Last refresh */}
        {lastRefresh && (
          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-700 tabular-nums ml-1">
            <Activity className="h-3 w-3" />
            {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}

        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="glass-sm flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          </button>
        )}

        {/* Bell */}
        <button className="glass-sm relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 transition-all hover:scale-105 active:scale-95">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" style={{ boxShadow: "0 0 5px rgba(99,102,241,0.9)" }} />
        </button>

        {/* Avatar */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold uppercase text-white cursor-pointer transition-all hover:scale-105"
          style={{ boxShadow: "0 0 14px rgba(99,102,241,0.45)" }}
        >
          {username?.[0] ?? "A"}
        </div>

        {children}
      </div>
    </header>
  );
}
