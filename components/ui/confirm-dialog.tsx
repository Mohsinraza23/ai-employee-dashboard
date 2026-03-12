"use client";

/**
 * ConfirmDialog — safety-first confirmation modal.
 *
 * Features:
 *  • severity: "warning" (amber) | "danger" (red) — colour-coded bar + icon
 *  • impact: string[] — "What will happen" consequence list
 *  • requireCheck — checkbox the user must tick before confirming
 *  • countdown — seconds to wait before the Confirm button activates
 *    (used for irreversible system-level actions like going LIVE)
 *
 * ── UX flow ──────────────────────────────────────────────────────────────────
 *
 *  1. Action button pressed
 *  2. Dialog appears (focus trapped on OK button or overlay)
 *  3. User reads title, body, and impact list
 *  4. If requireCheck: must tick checkbox before OK activates
 *  5. If countdown: must wait N seconds (button shows "Wait Xs…")
 *  6. Esc / click-outside / Cancel → resolves false (no toast)
 *  7. Confirm → resolves true → useAction proceeds with API call
 *
 * ── Severity guide ───────────────────────────────────────────────────────────
 *
 *  warning  — reversible or low-blast-radius: restart service, approve/reject
 *  danger   — irreversible or wide impact:    send email, post social, go LIVE
 */

import { useEffect, useRef, useState } from "react";
import { Button } from "./button";

type Severity = "warning" | "danger";

export interface ConfirmOptions {
  title:         string;
  body:          string;
  severity?:     Severity;
  confirmText?:  string;
  cancelText?:   string;
  /** Checkbox the user must tick before the Confirm button activates. */
  requireCheck?: boolean;
  checkLabel?:   string;
  /**
   * Consequence list rendered in an amber box under the body.
   * Use to show what will actually happen after confirmation.
   * e.g. ["Email delivered immediately", "Cannot be recalled"]
   */
  impact?:       string[];
  /**
   * Seconds before the Confirm button activates.
   * Forces the user to pause and read before confirming.
   * Recommended for severity="danger" + irreversible system actions.
   */
  countdown?:    number;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

// ── Singleton promise store ───────────────────────────────────────────────────

let _show: ((opts: ConfirmOptions) => Promise<boolean>) | null = null;

export function showConfirm(opts: ConfirmOptions): Promise<boolean> {
  if (!_show) return Promise.resolve(false);
  return _show(opts);
}

// ── Dialog ────────────────────────────────────────────────────────────────────

export function ConfirmDialog() {
  const [state,   setState]   = useState<ConfirmState | null>(null);
  const [checked, setChecked] = useState(false);
  const [secsLeft, setSecsLeft] = useState(0);
  const okRef = useRef<HTMLButtonElement>(null);

  // Register singleton
  useEffect(() => {
    _show = (opts) =>
      new Promise<boolean>((resolve) => {
        setChecked(false);
        setSecsLeft(opts.countdown ?? 0);
        setState({ ...opts, resolve });
      });
    return () => { _show = null; };
  }, []);

  // Countdown timer — ticks every second until zero
  useEffect(() => {
    if (secsLeft <= 0) return;
    const t = setInterval(() => setSecsLeft(s => Math.max(0, s - 1)), 1_000);
    return () => clearInterval(t);
  }, [secsLeft]);

  // Auto-focus confirm button once countdown reaches zero and check is ticked
  useEffect(() => {
    if (state && secsLeft === 0) okRef.current?.focus();
  }, [state, secsLeft]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!state) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter" && canConfirm) close(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  if (!state) return null;

  const {
    title, body, impact,
    severity    = "warning",
    confirmText = "Confirm",
    cancelText  = "Cancel",
    requireCheck, checkLabel = "I understand",
    countdown, resolve,
  } = state;

  const canConfirm = secsLeft <= 0 && (!requireCheck || checked);

  function close(ok: boolean) {
    setState(null);
    resolve(ok);
  }

  // ── Visual tokens by severity ─────────────────────────────────────────────
  const isDanger    = severity === "danger";
  const barColor    = isDanger ? "bg-red-500"   : "bg-amber-400";
  const okVariant   = isDanger ? "danger"        : "primary";
  const sevColor    = isDanger ? "text-red-500"  : "text-amber-600";
  const icon        = isDanger ? "⚠"             : "⚑";
  const sevLabel    = isDanger ? "DANGER"         : "WARNING";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 backdrop-blur-[2px] p-4"
      onClick={(e) => e.target === e.currentTarget && close(false)}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl animate-fade-in overflow-hidden">
        {/* Severity bar */}
        <div className={`h-1.5 ${barColor}`} />

        <div className="p-6 space-y-4">

          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="text-2xl leading-none mt-0.5" aria-hidden="true">{icon}</div>
            <div>
              <div className={`text-[10px] font-bold tracking-widest mb-0.5 ${sevColor}`}>
                {sevLabel}
              </div>
              <div id="confirm-title" className="text-base font-semibold text-gray-900">
                {title}
              </div>
            </div>
          </div>

          {/* Body */}
          <p className="text-sm text-gray-600">{body}</p>

          {/* Impact list — shows consequences */}
          {impact && impact.length > 0 && (
            <div className={`rounded-lg border p-3 space-y-1.5 ${
              isDanger
                ? "border-red-200 bg-red-50"
                : "border-amber-200 bg-amber-50"
            }`}>
              <p className={`text-[11px] font-bold tracking-wide uppercase mb-2 ${
                isDanger ? "text-red-700" : "text-amber-700"
              }`}>
                What will happen
              </p>
              {impact.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`mt-0.5 shrink-0 text-xs font-bold ${
                    isDanger ? "text-red-500" : "text-amber-500"
                  }`}>→</span>
                  <span className={`text-xs ${
                    isDanger ? "text-red-800" : "text-amber-800"
                  }`}>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Checkbox */}
          {requireCheck && (
            <label className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#5B62D8] focus:ring-[#5B62D8]"
              />
              <span>{checkLabel}</span>
            </label>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {/* Countdown progress */}
            {countdown && countdown > 0 && (
              <span className="text-xs text-gray-400">
                {secsLeft > 0
                  ? `Read the above — ${secsLeft}s remaining`
                  : "Ready to confirm"}
              </span>
            )}
            {(!countdown || countdown === 0) && <span />}

            <div className="flex gap-3">
              <Button variant="ghost" size="sm" onClick={() => close(false)}>
                {cancelText}
              </Button>
              <Button
                ref={okRef}
                variant={okVariant}
                size="sm"
                disabled={!canConfirm}
                onClick={() => close(true)}
              >
                {secsLeft > 0 ? `Wait ${secsLeft}s…` : confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
