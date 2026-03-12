"use client";

/**
 * Lightweight singleton toast system.
 *
 * Usage (anywhere, no Provider):
 *   toast.success("Email sent");
 *   toast.error("Failed to connect");
 *   toast.info("Reindex started in background");
 *
 * Mount once in app/layout.tsx:
 *   <ToastContainer />
 */

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id:      number;
  msg:     string;
  variant: ToastVariant;
}

type Dispatch = (msg: string, variant: ToastVariant) => void;

// ── Singleton store ────────────────────────────────────────────────────────────

let _dispatch: Dispatch | null = null;
const DURATION = 4_500;

function push(msg: string, variant: ToastVariant) {
  if (!_dispatch) {
    // Fallback if <ToastContainer> is not mounted yet
    console.warn(`[toast.${variant}]`, msg);
    return;
  }
  _dispatch(msg, variant);
}

export const toast = {
  success: (msg: string) => push(msg, "success"),
  error:   (msg: string) => push(msg, "error"),
  info:    (msg: string) => push(msg, "info"),
};

// ── Styles ────────────────────────────────────────────────────────────────────

const VARIANTS: Record<ToastVariant, { icon: React.ReactNode; cls: string }> = {
  success: {
    icon: <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />,
    cls:  "border-emerald-200 bg-white",
  },
  error: {
    icon: <XCircle className="h-4 w-4 shrink-0 text-red-500" />,
    cls:  "border-red-200 bg-white",
  },
  info: {
    icon: <Info className="h-4 w-4 shrink-0 text-blue-500" />,
    cls:  "border-blue-200 bg-white",
  },
};

// ── ToastContainer (mount once in root layout) ────────────────────────────────

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    _dispatch = (msg, variant) => {
      const id = Date.now() + Math.random();
      setItems(prev => [...prev.slice(-4), { id, msg, variant }]);   // cap at 5
      setTimeout(() => {
        setItems(prev => prev.filter(t => t.id !== id));
      }, DURATION);
    };
    return () => { _dispatch = null; };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-[99999] flex flex-col gap-2"
    >
      {items.map(item => {
        const { icon, cls } = VARIANTS[item.variant];
        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3",
              "shadow-lg shadow-black/10 animate-fade-in",
              cls,
            )}
          >
            {icon}
            <p className="flex-1 text-sm text-gray-800">{item.msg}</p>
            <button
              onClick={() => setItems(prev => prev.filter(t => t.id !== item.id))}
              className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
