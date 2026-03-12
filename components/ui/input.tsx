"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 " +
  "placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none " +
  "focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(baseCls, className)} {...props} />
  ),
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(baseCls, "resize-none", className)} {...props} />
  ),
);
Textarea.displayName = "Textarea";
