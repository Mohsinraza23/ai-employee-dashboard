import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  className?: string;
  style?:     CSSProperties;
  children:   ReactNode;
  glow?:      boolean;
  hover?:     boolean;
}

export function Card({ className, style, children, glow = false, hover = true }: CardProps) {
  return (
    <div
      style={style}
      className={cn(
        "glass rounded-2xl shadow-card overflow-hidden",
        hover && "transition-all duration-300 hover:-translate-y-[2px] hover:shadow-card-hover",
        glow  && "hover:glow-indigo",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-3 px-5 py-3.5",
      "border-b border-white/[0.06]",
      className,
    )}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h3 className={cn("text-[13px] font-semibold text-slate-200 leading-snug", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("p-5", className)}>{children}</div>
  );
}
