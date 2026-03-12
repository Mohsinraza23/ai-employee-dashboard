/**
 * auth.ts — token storage, cookie management, and header generation.
 *
 * ── Storage layout ────────────────────────────────────────────────────────────
 *
 *  localStorage["ai_employee_token"]    JWT from Flask /api/login
 *  localStorage["ai_employee_username"] Display name
 *  localStorage["ai_employee_role"]     "admin" | "user"
 *  localStorage["ai_employee_expiry"]   Unix epoch ms when token expires
 *                                       (estimated client-side: login time + TTL)
 *
 *  cookie "ai_employee_auth"=1          Non-sensitive presence signal for
 *                                       Next.js middleware (server-side gating)
 *                                       max-age=604800 (7 days)
 *                                       Secure in production (HTTPS)
 *                                       SameSite=Strict (CSRF protection)
 *
 * ── Why not httpOnly cookie? ──────────────────────────────────────────────────
 *
 *  The Flask API reads X-User-Token from request headers, not from cookies.
 *  httpOnly cookies can't be read by JavaScript, so we can't include the token
 *  in the Authorization / X-User-Token header for fetch() calls.
 *  Compromise: store the token in localStorage (accessible to fetch),
 *  write a non-sensitive boolean cookie so Edge Middleware can gate routes.
 *
 * ── Session expiry flow ───────────────────────────────────────────────────────
 *
 *  1. saveAuth() records expiry = Date.now() + TOKEN_TTL_MS
 *  2. getAuthHeaders() checks isTokenExpired() — if true, dispatches
 *     "auth:unauthorized" so AuthContext auto-logouts before the API call
 *  3. On any real 401 from Flask, lib/api.ts also dispatches the event
 *  4. AuthContext.logout() calls clearAuth() → removes localStorage keys
 *     and expires the cookie → middleware gates next navigation
 */

const TOKEN_KEY    = "ai_employee_token";
const USERNAME_KEY = "ai_employee_username";
const ROLE_KEY     = "ai_employee_role";
const EXPIRY_KEY   = "ai_employee_expiry";

// Must match middleware.ts default (process.env.AUTH_COOKIE_NAME ?? "ai_employee_auth")
const COOKIE_NAME  = "ai_employee_auth";

// How long we estimate the token lasts on the server (Flask default: 7 days).
// Set to slightly less to catch expiry before the 401 fires.
const TOKEN_TTL_MS = 6.5 * 24 * 60 * 60 * 1_000;   // 6.5 days in ms

// ── Helpers ───────────────────────────────────────────────────────────────────

function isClient() { return typeof window !== "undefined"; }

function cookieAttributes() {
  const secure = isClient() && window.location.protocol === "https:" ? "; Secure" : "";
  return `path=/; SameSite=Strict; max-age=604800${secure}`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function saveAuth(token: string, username: string, role: string) {
  if (!isClient()) return;
  localStorage.setItem(TOKEN_KEY,    token);
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(ROLE_KEY,     role);
  localStorage.setItem(EXPIRY_KEY,   String(Date.now() + TOKEN_TTL_MS));
  document.cookie = `${COOKIE_NAME}=1; ${cookieAttributes()}`;
}

export function clearAuth() {
  if (!isClient()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  // Expire the cookie immediately
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export function getToken():    string | null { return isClient() ? localStorage.getItem(TOKEN_KEY)    : null; }
export function getUsername(): string | null { return isClient() ? localStorage.getItem(USERNAME_KEY) : null; }
export function getRole():     string | null { return isClient() ? localStorage.getItem(ROLE_KEY)     : null; }
export function isAdmin():     boolean       { return getRole() === "admin"; }
export function isAuthenticated(): boolean   { return !!getToken() && !isTokenExpired(); }

/**
 * True if the locally-estimated token expiry has passed.
 * This is a client-side heuristic — the server is the authority.
 * A false negative (token actually expired but we didn't know) is caught
 * when the next API call returns 401 and dispatches "auth:unauthorized".
 */
export function isTokenExpired(): boolean {
  if (!isClient()) return false;
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!expiry) return false;
  return Date.now() > parseInt(expiry, 10);
}

// ── Request headers ───────────────────────────────────────────────────────────

export function getAuthHeaders(): HeadersInit {
  const token = getToken();

  // Detect client-side expiry before the request fires
  if (token && isTokenExpired() && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    return { "Content-Type": "application/json" };
  }

  if (!token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    "X-User-Token": token,
  };
}

/**
 * Build Basic-Auth header for legacy admin requests.
 * Used when the backend accepts DASHBOARD_USER / DASHBOARD_PASSWORD
 * rather than per-user token auth.
 */
export function getBasicAuthHeader(username: string, password: string): HeadersInit {
  const encoded = btoa(`${username}:${password}`);
  return {
    "Content-Type":  "application/json",
    "Authorization": `Basic ${encoded}`,
  };
}
