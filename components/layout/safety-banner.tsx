"use client";

import { useDryRun } from "@/context/dry-run-context";
import { useAuth } from "@/context/auth-context";
import { FlaskConical, ShieldCheck, Zap, AlertTriangle } from "lucide-react";

export function SafetyBanner() {
  const { isDryRun, demoMode, toggleDemoMode, toggleDryRun, loading } = useDryRun();
  const { isAdmin } = useAuth();

  const bannerBtn =
    "relative rounded-lg border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white " +
    "backdrop-blur-sm hover:bg-white/20 transition-all duration-150 hover:scale-[1.03] active:scale-95 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  if (demoMode) {
    return (
      <div
        className="animate-fade-in relative flex items-center justify-between gap-3 overflow-hidden px-5 py-2.5"
        style={{ background: "linear-gradient(90deg,#1e1b4b 0%,#312e81 45%,#3730a3 100%)" }}
      >
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
            <FlaskConical className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white">Demo Mode</span>
          <span className="hidden sm:inline text-xs text-indigo-200/60">
            All actions are simulated. Nothing real will execute.
          </span>
        </div>
        <button onClick={toggleDemoMode} className={bannerBtn}>
          Exit Demo
        </button>
      </div>
    );
  }

  if (isDryRun) {
    return (
      <div
        className="animate-fade-in relative flex items-center justify-between gap-3 overflow-hidden px-5 py-2.5"
        style={{ background: "linear-gradient(90deg,#0c2540 0%,#0c4a6e 45%,#075985 100%)" }}
      >
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
            <ShieldCheck className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white">Dry Run</span>
          <span className="hidden sm:inline text-xs text-sky-200/60">
            Safe mode active. No emails, posts, or payments will execute.
          </span>
        </div>
        {isAdmin && (
          <button onClick={toggleDryRun} disabled={loading} className={bannerBtn}>
            Go LIVE →
          </button>
        )}
      </div>
    );
  }

  // LIVE
  return (
    <div
      className="animate-fade-in relative flex items-center justify-between gap-3 overflow-hidden px-5 py-2.5"
      style={{ background: "linear-gradient(90deg,#450a0a 0%,#7f1d1d 45%,#991b1b 100%)" }}
    >
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
          <Zap className="h-3 w-3 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-white">Live Mode</span>
        <span className="hidden sm:inline text-xs text-red-200/60">
          Real emails, social posts &amp; payments are executing.
        </span>
      </div>
      {isAdmin && (
        <button
          onClick={toggleDryRun}
          disabled={loading}
          className={`${bannerBtn} inline-flex items-center gap-1.5`}
        >
          <AlertTriangle className="h-3 w-3" />
          Switch to Dry Run
        </button>
      )}
    </div>
  );
}
