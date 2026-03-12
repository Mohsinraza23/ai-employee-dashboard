import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * middleware.ts — route protection + security headers.
 *
 * ── Auth flow ─────────────────────────────────────────────────────────────────
 *
 *  1. Browser visits any dashboard route
 *  2. Middleware runs at the Edge (before rendering)
 *  3. Checks for presence of `ai_employee_auth` cookie
 *     • Cookie is set by saveAuth() in lib/auth.ts on successful login
 *     • Cookie value is always "1" — non-sensitive presence signal only
 *     • Actual JWT token lives in localStorage, sent as X-User-Token header
 *  4. If cookie missing → redirect /login?from=<original-path>
 *  5. Login page POSTs credentials → Flask /api/login → JWT token
 *  6. saveAuth() stores token in localStorage + writes cookie
 *  7. Next.js router.replace(from) → user lands on original page
 *
 * ── Why cookie + localStorage (not httpOnly cookie) ──────────────────────────
 *
 *  • httpOnly cookies can't be read by JS — we'd need a /api/auth/me
 *    server route to pass the token to client components on every request.
 *  • The Flask API expects X-User-Token in headers (not a cookie), so the
 *    token must be accessible to browser fetch() calls.
 *  • We use a non-sensitive session cookie ONLY to give middleware (server-side)
 *    enough signal to gate routes. The cookie itself contains no secret.
 *  • Trade-off: XSS can read localStorage — mitigated by CSP in vercel.json
 *    and by the fact this is an internal admin dashboard.
 *
 * ── 401 interceptor ───────────────────────────────────────────────────────────
 *
 *  When a live session token expires, the next Flask API call returns 401.
 *  lib/api.ts dispatches `window.dispatchEvent(new CustomEvent("auth:unauthorized"))`
 *  which AuthContext catches → calls logout() → clears cookie → middleware
 *  gates the next page navigation back to /login.
 */

const COOKIE_NAME    = process.env.AUTH_COOKIE_NAME ?? "ai_employee_auth";
const PUBLIC_PATHS   = ["/login"];
// Redirect authenticated users here (skips the /dashboard stub redirect)
const DASHBOARD_ROOT = "/dashboard/overview";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
  const hasAuth  = req.cookies.has(COOKIE_NAME);

  // ── Logged-in user hits public page ────────────────────────────────────────
  if (isPublic && hasAuth) {
    // Honour ?from= if it was set before the session expired
    const from = req.nextUrl.searchParams.get("from");
    const dest  = from && from.startsWith("/") && !from.startsWith("/login")
      ? from
      : DASHBOARD_ROOT;
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // ── Guest hits protected page ───────────────────────────────────────────────
  if (!isPublic && !hasAuth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Run on all paths except:
   *  • _next/static / _next/image — Next.js build artefacts
   *  • favicon.ico / manifest files
   *  • /api/ — Next.js route handlers (Flask proxy or internal routes)
   *
   * Note: the root "/" IS matched — app/page.tsx handles the redirect
   * to /dashboard/overview for authenticated users.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest|api/).*)"],
};
