"use client";

/**
 * AuthContext — global authentication state.
 *
 * ── Auth flow ─────────────────────────────────────────────────────────────────
 *
 *  Login:
 *    1. LoginPage calls login({ username, password })
 *    2. POST /api/login → { ok, token, username, role }
 *    3. saveAuth() writes token to localStorage + sets presence cookie
 *    4. State updated → ready=true, token set, isAdmin derived from role
 *    5. Router redirects to ?from= or /dashboard/overview
 *
 *  Per-request auth:
 *    6. Every api.* call reads getAuthHeaders() → adds X-User-Token header
 *    7. Flask verifies the token, returns data or 401/403
 *
 *  Session expiry (401 interceptor):
 *    8. lib/api.ts detects 401 → dispatches "auth:unauthorized" event
 *    9. AuthContext listener catches it → calls logout()
 *   10. logout() → clearAuth() (localStorage + cookie) → window.location="/login"
 *   11. Middleware sees no cookie → gates dashboard routes → login redirect
 *
 *  Tab visibility check:
 *   12. When the user returns to a hidden tab, AuthContext checks isTokenExpired()
 *   13. If expired: logout() before any API call can 401
 *
 *  Logout:
 *   14. User clicks logout in Sidebar → logout() called directly
 *   15. Same cleanup as step 10
 */

import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";
import { api }                                              from "@/lib/api";
import { saveAuth, clearAuth, getToken, getUsername, getRole, isTokenExpired } from "@/lib/auth";
import type { LoginRequest }                                from "@/types/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  token:    string | null;
  username: string | null;
  role:     "admin" | "user" | null;
  isAdmin:  boolean;
  ready:    boolean;    // false until localStorage hydration is complete
}

interface AuthContextValue extends AuthState {
  login:  (creds: LoginRequest) => Promise<void>;
  logout: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token:    null,
    username: null,
    role:     null,
    isAdmin:  false,
    ready:    false,
  });

  // Track logout reason for the login page message
  const logoutReasonRef = useRef<string | undefined>(undefined);

  // ── Hydrate from localStorage on first render ────────────────────────────
  useEffect(() => {
    const token    = getToken();
    const username = getUsername();
    const role     = getRole() as "admin" | "user" | null;

    // If the stored token is already expired, clear it immediately
    if (token && isTokenExpired()) {
      clearAuth();
      setState({ token: null, username: null, role: null, isAdmin: false, ready: true });
      return;
    }

    setState({ token, username, role, isAdmin: role === "admin", ready: true });
  }, []);

  // ── 401 interceptor ───────────────────────────────────────────────────────
  // lib/api.ts dispatches this event whenever Flask returns 401.
  // We immediately logout so the user sees the login page (with a reason message)
  // rather than a series of error toasts as every poll fails.
  useEffect(() => {
    function handleUnauthorized() {
      // Only act if we think we're logged in — avoids double-logout
      if (getToken()) {
        logout("Your session has expired. Please log in again.");
      }
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tab visibility — proactive expiry check ────────────────────────────────
  // When user returns to a backgrounded tab, check whether the token expired
  // while they were away. This prevents stale-session API calls on wake.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && getToken() && isTokenExpired()) {
        logout("Your session expired while you were away. Please log in again.");
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (creds: LoginRequest) => {
    const res = await api.login(creds);
    if (!res.ok) throw new Error((res as unknown as { error: string }).error);
    saveAuth(res.token, res.username, res.role);
    setState({
      token:    res.token,
      username: res.username,
      role:     res.role,
      isAdmin:  res.role === "admin",
      ready:    true,
    });
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback((reason?: string) => {
    logoutReasonRef.current = reason;
    clearAuth();
    setState({ token: null, username: null, role: null, isAdmin: false, ready: true });

    // Build the login URL with an optional "expired" reason message
    const loginUrl = new URL("/login", window.location.origin);
    if (reason) loginUrl.searchParams.set("msg", encodeURIComponent(reason));

    // Hard redirect — ensures all React state, polling intervals, and
    // event listeners are torn down cleanly (vs router.push which doesn't
    // unmount everything).
    window.location.href = loginUrl.toString();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
