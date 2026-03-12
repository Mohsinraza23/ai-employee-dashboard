"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Count-up hook ───────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isNaN(target)) return;
    const start = performance.now();
    startRef.current = start;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

/* ── Icon colors ─────────────────────────────────────────────────────────── */
const iconConfig: Record<string, { bg: string; icon: string; glow: string }> = {
  indigo:  { bg: "from-indigo-600  to-purple-600",  icon: "text-indigo-200",  glow: "rgba(99,102,241,0.4)" },
  emerald: { bg: "from-emerald-600 to-teal-600",    icon: "text-emerald-200", glow: "rgba(16,185,129,0.4)" },
  amber:   { bg: "from-amber-500   to-orange-600",  icon: "text-amber-200",   glow: "rgba(245,158,11,0.4)" },
  red:     { bg: "from-red-600     to-rose-600",    icon: "text-red-200",     glow: "rgba(239,68,68,0.4)" },
  cyan:    { bg: "from-cyan-600    to-sky-600",      icon: "text-cyan-200",    glow: "rgba(6,182,212,0.4)" },
  violet:  { bg: "from-violet-600  to-purple-700",  icon: "text-violet-200",  glow: "rgba(139,92,246,0.4)" },
};

interface StatCardProps {
  icon:        LucideIcon;
  iconColor?:  keyof typeof iconConfig;
  label:       string;
  value:       string | number;
  description?: string;
  trend?:      { value: number; positive?: boolean };
  loading?:    boolean;
  delay?:      number;
  className?:  string;
}

export function StatCard({
  icon: Icon,
  iconColor = "indigo",
  label,
  value,
  description,
  trend,
  loading,
  delay = 0,
  className,
}: StatCardProps) {
  const isNumeric = typeof value === "number" || (typeof value === "string" && !isNaN(Number(value.replace(/[$,\/\s]/g, "").split("/")[0])));
  const numericTarget = isNumeric
    ? parseFloat(String(value).replace(/[$,]/g, "").split("/")[0])
    : 0;
  const countedNum = useCountUp(loading ? 0 : numericTarget);

  const displayValue = loading
    ? "—"
    : isNumeric && typeof value === "number"
      ? countedNum
      : value;

  const cfg = iconConfig[iconColor] ?? iconConfig.indigo;
  const trendPositive =
    trend ? (trend.positive !== undefined ? trend.positive : trend.value >= 0) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative group glass rounded-3xl p-6 overflow-hidden",
        "hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-shadow duration-300",
        className,
      )}
    >
      {/* Background glow orb */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${cfg.glow}, transparent)` }}
      />

      {/* Gradient border shimmer on hover */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 60%)" }}
      />

      {/* Top row: icon + trend */}
      <div className="relative flex items-start justify-between mb-5">
        <div
          className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg", cfg.bg)}
          style={{ boxShadow: `0 4px 14px ${cfg.glow}` }}
        >
          <Icon className={cn("h-5 w-5", cfg.icon)} strokeWidth={2} />
        </div>

        {trend != null && (
          <div className={cn(
            "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border",
            trendPositive
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/25 bg-red-500/10 text-red-400",
          )}>
            {trendPositive
              ? <TrendingUp className="h-3 w-3" />
              : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative">
        {loading ? (
          <div className="h-8 w-24 rounded-lg shimmer" />
        ) : (
          <div className="metric-value">{displayValue}</div>
        )}
        <div className="mt-1.5 text-sm font-medium text-zinc-400">{label}</div>
        {description && (
          <div className="mt-0.5 text-[11px] text-zinc-600">{description}</div>
        )}
      </div>
    </motion.div>
  );
}
