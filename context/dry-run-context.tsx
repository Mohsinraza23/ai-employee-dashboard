"use client";

/**
 * DryRunContext — global safety mode state.
 *
 * ── Two independent safety layers ────────────────────────────────────────────
 *
 *  1. Backend DRY_RUN flag (`isDryRun`)
 *     • Stored in the Flask .env file
 *     • Admin-only toggle via POST /api/dry-run
 *     • When true: Flask scripts ignore external side-effects
 *     • Going LIVE requires a danger modal + 5-second countdown
 *
 *  2. Demo Mode (`demoMode`)
 *     • Client-side only — any logged-in user can toggle
 *     • When true: action pages pass dry_run=true to every API call
 *     • Shown as a prominent indigo banner across all pages
 *     • Designed for walkthroughs, onboarding, and screen shares
 *
 *  `isSafe = isDryRun || demoMode`
 *
 *  Action pages should:
 *    const { isSafe, demoMode } = useDryRun();
 *    api.postLinkedIn(content, isSafe ? true : false)
 *
 * ── UX flow for going LIVE ────────────────────────────────────────────────────
 *
 *  Admin clicks DRY RUN pill → danger modal with:
 *    • Body: "Emails will send, posts will publish, payments will execute"
 *    • Impact list: 3 specific consequence bullets
 *    • requireCheck: true
 *    • countdown: 5 (button disabled for 5 seconds)
 *  Only after that: PATCH /api/dry-run { dry_run: false }
 */

import {
  createContext, useCallback, useContext, useEffect, useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { toast } from "@/components/ui/toast";
import { showConfirm } from "@/components/ui/confirm-dialog";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DryRunState {
  isDryRun:  boolean;
  demoMode:  boolean;
  loading:   boolean;
  /** True if backend isDryRun OR client demoMode — safe to send real actions */
  isSafe:    boolean;
}

interface DryRunContextValue extends DryRunState {
  /** Toggle backend DRY_RUN (admin only, requires confirm + countdown when going LIVE) */
  toggleDryRun:   () => Promise<void>;
  /** Toggle client-side demo mode (any user, instant) */
  toggleDemoMode: () => void;
  /** Force-refresh from the backend */
  refresh:        () => Promise<void>;
}

const DryRunContext = createContext<DryRunContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function DryRunProvider({ children }: { children: ReactNode }) {
  const { isAdmin }  = useAuth();
  const [isDryRun,  setIsDryRun]  = useState(true);    // default safe until fetched
  const [demoMode,  setDemoMode]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await api.getDryRun();
      setIsDryRun(res.dry_run);
    } catch {
      // silent — keep previous state, UI shows last known value
    }
  }, []);

  // Initial fetch + 30s background poll
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  // ── Toggle backend DRY_RUN ─────────────────────────────────────────────────
  const toggleDryRun = useCallback(async () => {
    if (!isAdmin) {
      toast.error("Admin access required to change DRY_RUN mode.");
      return;
    }

    const goingLive = isDryRun;   // currently dry → switching to live

    if (goingLive) {
      const ok = await showConfirm({
        title:        "Switch to LIVE mode?",
        body:         "In LIVE mode the system executes real-world actions immediately. This affects every user and every automated daemon.",
        severity:     "danger",
        countdown:    5,
        impact: [
          "Emails will be delivered to real recipients",
          "Social posts will publish to LinkedIn, Twitter, and Facebook",
          "WhatsApp messages will be sent to real phone numbers",
          "Bank data and financial operations will be live",
        ],
        requireCheck: true,
        checkLabel:   "I understand all actions are now real and cannot be undone",
        confirmText:  "Go LIVE",
      });
      if (!ok) return;
    }

    setLoading(true);
    try {
      const res = await api.setDryRun(!isDryRun);
      setIsDryRun(res.dry_run);
      if (res.dry_run) {
        toast.success("Switched to DRY RUN — no external actions will execute");
      } else {
        toast.error("⚠ LIVE mode activated — all actions are now real");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update mode");
    } finally {
      setLoading(false);
    }
  }, [isDryRun, isAdmin]);

  // ── Toggle demo mode ───────────────────────────────────────────────────────
  const toggleDemoMode = useCallback(() => {
    setDemoMode(prev => {
      const next = !prev;
      if (next) toast.info("Demo Mode on — all actions are simulated");
      else      toast.info("Demo Mode off");
      return next;
    });
  }, []);

  return (
    <DryRunContext.Provider
      value={{
        isDryRun,
        demoMode,
        loading,
        isSafe: isDryRun || demoMode,
        toggleDryRun,
        toggleDemoMode,
        refresh,
      }}
    >
      {children}
    </DryRunContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDryRun(): DryRunContextValue {
  const ctx = useContext(DryRunContext);
  if (!ctx) throw new Error("useDryRun must be used within <DryRunProvider>");
  return ctx;
}
