import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Status = "online" | "offline" | "degraded" | "pending" | "done" | "error" | "live" | "dry" | "demo";

const statusConfig: Record<Status, { label: string; dot: string; cls: string; glow?: string }> = {
  online:   { label: "Online",   dot: "bg-emerald-400", cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300", glow: "0 0 8px rgba(52,211,153,0.4)" },
  offline:  { label: "Offline",  dot: "bg-red-400",     cls: "border-red-500/25    bg-red-500/10    text-red-300" },
  degraded: { label: "Degraded", dot: "bg-amber-400",   cls: "border-amber-500/25  bg-amber-500/10  text-amber-300" },
  pending:  { label: "Pending",  dot: "bg-amber-400",   cls: "border-amber-500/25  bg-amber-500/10  text-amber-300" },
  done:     { label: "Done",     dot: "bg-emerald-400", cls: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" },
  error:    { label: "Error",    dot: "bg-red-400",     cls: "border-red-500/25    bg-red-500/10    text-red-300" },
  live:     { label: "● LIVE",   dot: "bg-red-400",     cls: "border-red-500/30    bg-red-500/10    text-red-300",    glow: "0 0 10px rgba(239,68,68,0.3)" },
  dry:      { label: "Dry Run",  dot: "bg-sky-400",     cls: "border-sky-500/25    bg-sky-500/10    text-sky-300" },
  demo:     { label: "Demo",     dot: "bg-indigo-400",  cls: "border-indigo-500/25 bg-indigo-500/10 text-indigo-300" },
};

interface StatusBadgeProps {
  status:     Status | string;
  label?:     string;
  dot?:       boolean;
  pulse?:     boolean;
  className?: string;
  children?:  ReactNode;
}

export function StatusBadge({ status, label, dot = true, pulse = false, className, children }: StatusBadgeProps) {
  const cfg = statusConfig[status as Status] ?? {
    label: status,
    dot: "bg-slate-500",
    cls: "border-slate-500/25 bg-slate-500/10 text-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none",
        cfg.cls,
        className,
      )}
      style={cfg.glow ? { boxShadow: cfg.glow } : undefined}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-60", cfg.dot)} />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", cfg.dot)} />
        </span>
      )}
      {children ?? label ?? cfg.label}
    </span>
  );
}
