import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Accent = "indigo" | "purple" | "emerald" | "amber" | "red" | "cyan" | "violet" | "rose";

const accentStyles: Record<Accent, { bg: string; glow: string; text: string }> = {
  indigo:  { bg: "from-indigo-500 to-indigo-700",   glow: "shadow-[0_4px_16px_rgba(99,102,241,0.4)]",   text: "text-indigo-400" },
  purple:  { bg: "from-purple-500 to-purple-700",   glow: "shadow-[0_4px_16px_rgba(168,85,247,0.4)]",   text: "text-purple-400" },
  emerald: { bg: "from-emerald-500 to-teal-600",    glow: "shadow-[0_4px_16px_rgba(16,185,129,0.4)]",   text: "text-emerald-400" },
  amber:   { bg: "from-amber-500 to-orange-600",    glow: "shadow-[0_4px_16px_rgba(245,158,11,0.4)]",   text: "text-amber-400" },
  red:     { bg: "from-red-500 to-rose-600",        glow: "shadow-[0_4px_16px_rgba(239,68,68,0.4)]",    text: "text-red-400" },
  cyan:    { bg: "from-cyan-500 to-sky-600",        glow: "shadow-[0_4px_16px_rgba(6,182,212,0.4)]",    text: "text-cyan-400" },
  violet:  { bg: "from-violet-500 to-purple-700",   glow: "shadow-[0_4px_16px_rgba(139,92,246,0.4)]",   text: "text-violet-400" },
  rose:    { bg: "from-rose-500 to-pink-600",       glow: "shadow-[0_4px_16px_rgba(244,63,94,0.4)]",    text: "text-rose-400" },
};

interface PageHeaderProps {
  icon:        LucideIcon;
  title:       string;
  description?: string;
  accent?:     Accent;
  children?:   ReactNode;
  className?:  string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  accent = "indigo",
  children,
  className,
}: PageHeaderProps) {
  const s = accentStyles[accent];

  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div className="flex items-center gap-4">
        {/* Icon bubble */}
        <div className={cn(
          "relative flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br",
          s.bg, s.glow,
        )}>
          <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50 blur-md -z-10", s.bg)} />
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>

        {/* Text */}
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      </div>

      {/* Right slot */}
      {children && (
        <div className="flex items-center gap-2 shrink-0 mt-0.5">{children}</div>
      )}
    </div>
  );
}
