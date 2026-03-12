import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "indigo" | "purple";

interface BadgeProps {
  variant?:   BadgeVariant;
  className?: string;
  children:   ReactNode;
  dot?:       boolean;
  glow?:      boolean;
}

const styles: Record<BadgeVariant, { base: string; dot: string; glow?: string }> = {
  default: { base: "border-white/10   bg-white/[0.06]   text-zinc-400",    dot: "bg-zinc-500" },
  success: { base: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-400", glow: "shadow-[0_0_10px_rgba(16,185,129,0.15)]" },
  warning: { base: "border-amber-500/25  bg-amber-500/10  text-amber-400",  dot: "bg-amber-400",  glow: "shadow-[0_0_10px_rgba(245,158,11,0.15)]" },
  danger:  { base: "border-red-500/25    bg-red-500/10    text-red-400",    dot: "bg-red-400",   glow: "shadow-[0_0_10px_rgba(239,68,68,0.15)]" },
  info:    { base: "border-sky-500/25    bg-sky-500/10    text-sky-400",    dot: "bg-sky-400" },
  indigo:  { base: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300", dot: "bg-indigo-400", glow: "shadow-[0_0_10px_rgba(99,102,241,0.2)]" },
  purple:  { base: "border-purple-500/30 bg-purple-500/10 text-purple-300", dot: "bg-purple-400" },
};

export function Badge({ variant = "default", className, children, dot, glow }: BadgeProps) {
  const s = styles[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none",
        s.base,
        glow && s.glow,
        className,
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.dot)} />
      )}
      {children}
    </span>
  );
}
