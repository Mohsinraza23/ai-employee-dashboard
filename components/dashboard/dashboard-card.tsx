"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Count-up animation ──────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isFinite(target) || isNaN(target)) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * p); // easeOutExpo
      setValue(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

/* ── Accent colors ───────────────────────────────────────────────────────── */
type Accent = "indigo" | "purple" | "emerald" | "amber" | "red" | "cyan" | "violet";

const accentMap: Record<Accent, { gradient: string; glow: string; text: string }> = {
  indigo:  { gradient: "from-indigo-500  to-indigo-700",  glow: "rgba(99,102,241,0.5)",   text: "text-indigo-300" },
  purple:  { gradient: "from-purple-500  to-purple-700",  glow: "rgba(168,85,247,0.5)",   text: "text-purple-300" },
  emerald: { gradient: "from-emerald-500 to-teal-600",    glow: "rgba(16,185,129,0.5)",   text: "text-emerald-300" },
  amber:   { gradient: "from-amber-500   to-orange-600",  glow: "rgba(245,158,11,0.5)",   text: "text-amber-300" },
  red:     { gradient: "from-red-500     to-rose-600",    glow: "rgba(239,68,68,0.5)",    text: "text-red-300" },
  cyan:    { gradient: "from-cyan-500    to-sky-600",     glow: "rgba(6,182,212,0.5)",    text: "text-cyan-300" },
  violet:  { gradient: "from-violet-500  to-purple-700",  glow: "rgba(139,92,246,0.5)",   text: "text-violet-300" },
};

export interface DashboardCardProps {
  icon:        LucideIcon;
  accent?:     Accent;
  label:       string;
  value:       string | number;
  description?: string;
  trend?:      { value: number; positive?: boolean };
  loading?:    boolean;
  delay?:      number;
  className?:  string;
}

export function DashboardCard({
  icon: Icon,
  accent = "indigo",
  label,
  value,
  description,
  trend,
  loading,
  delay = 0,
  className,
}: DashboardCardProps) {
  const cfg = accentMap[accent];

  // Count-up only for pure numbers
  const isNum    = typeof value === "number";
  const counted  = useCountUp(loading ? 0 : isNum ? (value as number) : 0);
  const display  = loading ? "—" : isNum ? counted : value;

  const trendPos = trend
    ? (trend.positive !== undefined ? trend.positive : trend.value >= 0)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl",
        "transition-shadow duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      {/* Radial glow behind card on hover */}
      <motion.div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-0 group-hover:opacity-70 pointer-events-none transition-opacity duration-500"
        style={{ background: `radial-gradient(circle, ${cfg.glow}, transparent)` }}
      />

      {/* Subtle top gradient shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Icon + trend row */}
      <div className="relative flex items-start justify-between mb-5">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg",
            cfg.gradient,
          )}
          style={{ boxShadow: `0 4px 16px ${cfg.glow}` }}
        >
          <Icon className="h-6 w-6 text-white" strokeWidth={2} />
        </div>

        {/* Trend badge */}
        {trend != null && (
          <div className={cn(
            "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold",
            trendPos
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/25 bg-red-500/10 text-red-300",
          )}>
            {trendPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative">
        {loading ? (
          <div className="shimmer h-8 w-24 rounded-lg" />
        ) : (
          <div className="metric-value">{display}</div>
        )}
        <div className="mt-1.5 text-sm font-medium text-slate-400">{label}</div>
        {description && (
          <div className="mt-0.5 text-[11px] text-slate-600">{description}</div>
        )}
      </div>
    </motion.div>
  );
}
