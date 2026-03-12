import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "gradient";
type ButtonSize    = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  children:  ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  gradient:
    "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-400 hover:to-purple-400 hover:scale-105 active:scale-[0.98] shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:shadow-[0_0_30px_rgba(99,102,241,0.55)]",
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-[0.98] shadow-[0_0_15px_rgba(99,102,241,0.3)]",
  secondary:
    "glass-sm text-slate-300 hover:bg-white/[0.08] hover:text-white hover:scale-[1.02] active:scale-[0.98]",
  ghost:
    "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200 hover:scale-[1.02]",
  danger:
    "bg-red-600/80 text-white hover:bg-red-600 hover:scale-105 active:scale-[0.98] border border-red-500/30",
  outline:
    "border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/70 hover:scale-[1.02]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8  px-3   text-xs gap-1.5 rounded-xl",
  md: "h-9  px-4   text-sm gap-2   rounded-xl",
  lg: "h-10 px-5   text-sm gap-2   rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "secondary", size = "md", loading = false, disabled, className, children, ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        {...props}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950",
          "disabled:pointer-events-none disabled:opacity-40",
          variants[variant],
          sizes[size],
          className,
        )}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);
