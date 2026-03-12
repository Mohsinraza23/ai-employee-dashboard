"use client";

/**
 * useAction — wraps any async API call with:
 *   • loading state
 *   • automatic toast feedback (success / error)
 *   • optional confirm dialog before executing
 *
 * ── Error handling strategy ───────────────────────────────────────────────────
 *
 * All API calls in lib/api.ts throw Error with human-readable messages:
 *   • Network failure  → "Failed to fetch"
 *   • 401              → "Unauthorized — please log in again."
 *   • 403              → "Forbidden — admin access required."
 *   • 4xx/5xx          → body.error or "HTTP <status>"
 *
 * useAction catches every thrown Error and:
 *   1. Shows a toast.error() with the message (or opts.errorMsg override)
 *   2. Returns null so callers never need try/catch
 *   3. Keeps loading=false after failure
 *
 * For read-only polling, use usePoll — it stores error in poll.error state
 * and callers render an inline error message.
 *
 * For one-off reads that don't need toast, use safeCall() from lib/api.ts.
 *
 * ── Stale opts guard ─────────────────────────────────────────────────────────
 *
 * `opts` (confirm copy, successMsg) is stored in a ref so changes to
 * dynamic values (demoMode, form fields) are always picked up without
 * adding opts to the useCallback dep array (which would thrash on every
 * render when opts is an inline object literal).
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *
 *   const send = useAction(
 *     () => api.emailSend(to, subject, body),
 *     {
 *       successMsg: "Email sent",
 *       confirm:    WARN.emailSend(to),
 *     }
 *   );
 *
 *   <Button loading={send.loading} onClick={send.run}>Send</Button>
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { showConfirm } from "@/components/ui/confirm-dialog";
import type { ConfirmOptions } from "@/components/ui/confirm-dialog";

export interface UseActionOptions<T> {
  /** Toast message on success. Pass a function to derive it from the result. */
  successMsg?: string | ((result: T) => string);
  /** Override the thrown error message shown in the error toast. */
  errorMsg?: string;
  /** Show a confirm dialog before calling the API. Import from lib/warnings.ts. */
  confirm?: ConfirmOptions;
  /** Called with the result on success (after toast). */
  onSuccess?: (result: T) => void;
  /** Called with the error on failure (after toast). */
  onError?: (err: Error) => void;
}

export interface UseActionReturn<TArgs extends unknown[], TResult> {
  /** Call the action. Returns the result or null on cancel/error. */
  run: (...args: TArgs) => Promise<TResult | null>;
  /** True while the async call is in-flight. */
  loading: boolean;
}

export function useAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  opts?: UseActionOptions<TResult>,
): UseActionReturn<TArgs, TResult> {
  const [loading, setLoading] = useState(false);

  // Store opts in a ref so dynamic values (demoMode, form state) are
  // always current inside run() without re-creating the callback.
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      const currentOpts = optsRef.current;

      // 1. Optional confirm dialog — cancel aborts silently (no toast)
      if (currentOpts?.confirm) {
        const ok = await showConfirm(currentOpts.confirm);
        if (!ok) return null;
      }

      setLoading(true);
      try {
        const result = await fn(...args);

        // 2. Success toast
        if (currentOpts?.successMsg) {
          const msg =
            typeof currentOpts.successMsg === "function"
              ? currentOpts.successMsg(result)
              : currentOpts.successMsg;
          toast.success(msg);
        }

        currentOpts?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");

        // 3. Error toast — prefer explicit override, fall back to thrown message
        toast.error(currentOpts?.errorMsg ?? error.message);

        currentOpts?.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn],   // fn changes when form state changes, which is correct
  );

  return { run, loading };
}
