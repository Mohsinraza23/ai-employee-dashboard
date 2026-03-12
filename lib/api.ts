/**
 * API client — typed wrappers for every Flask endpoint.
 *
 * ── Error-handling contract ───────────────────────────────────────────────────
 *
 * Every function in `api` throws `Error` with a human-readable message:
 *   • Network timeout / offline  → "Failed to fetch"
 *   • HTTP 401                   → "Unauthorized — please log in again."
 *   • HTTP 403                   → "Forbidden — admin access required."
 *   • HTTP 4xx / 5xx             → body.error ?? "HTTP <status>"
 *
 * Callers should NOT wrap in try/catch. Instead use one of:
 *
 *   1. useAction(fn, opts)           — mutations (buttons). Catches errors,
 *                                      shows toast, returns null on failure.
 *
 *   2. usePoll({ fetcher, interval}) — polling reads. Stores error in .error,
 *                                      callers render inline error text.
 *
 *   3. safeCall(fn)                  — one-shot reads that need inline
 *                                      data/error handling without a hook.
 *
 * ── Auth ──────────────────────────────────────────────────────────────────────
 *
 *  • All requests inject X-User-Token from localStorage via getAuthHeaders().
 *  • Multipart (file upload) overrides Content-Type so the browser sets the
 *    multipart boundary automatically.
 *
 * ── Dev vs Prod ───────────────────────────────────────────────────────────────
 *
 *  • Local dev: NEXT_PUBLIC_API_URL is empty; next.config.ts rewrites
 *    /api/* → http://localhost:5000/api/* (no CORS needed).
 *  • Vercel / prod: set NEXT_PUBLIC_API_URL to the Flask server origin;
 *    Flask must have CORS open for that origin.
 */

import { getAuthHeaders } from "@/lib/auth";
import type {
  LoginRequest, LoginResponse, MeResponse,
  SystemResponse, HealthResponse, ServiceLogsResponse,
  TasksResponse, ApprovalsResponse, LogsResponse,
  FinanceResponse, ActivityResponse,
  BriefingSummary, BriefingFilesResponse,
  WhatsAppStatus, BankStatusResponse,
  SocialHistoryResponse, RagStatusResponse,
  WebhookStatusResponse, WebhookStats,
  DemoScenario, DemoResponse,
  UsersResponse, SetDryRunResponse,
  OkResponse,
} from "@/types/api";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// On Vercel the browser calls the Flask server directly (CORS must be open).
// In local dev the Next.js dev-server proxies /api/* → Flask (see next.config.ts).
function url(path: string) {
  return BASE ? `${BASE}${path}` : path;
}

// ── Core fetch helper ─────────────────────────────────────────────────────────

async function request<T>(
  path:    string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url(path), {
    headers: getAuthHeaders(),
    ...options,
    // Merge headers — options.headers (e.g. multipart/form-data) can override
    ...(options.headers
      ? { headers: { ...getAuthHeaders(), ...(options.headers as object) } }
      : {}),
  });

  if (res.status === 401) {
    // Signal AuthContext to auto-logout. The event is caught by the
    // useEffect in context/auth-context.tsx which calls logout() →
    // clearAuth() → middleware gates the next navigation to /login.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    throw new Error("Session expired — please log in again.");
  }
  if (res.status === 403) throw new Error("Forbidden — admin access required.");
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body:   JSON.stringify(body),
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  login:  (data: LoginRequest)  => post<LoginResponse>("/api/login", data),
  me:     ()                    => request<MeResponse>("/api/me"),

  // ── Core monitoring ─────────────────────────────────────────────────────────
  system:   () => request<SystemResponse>("/api/system"),
  health:   () => request<HealthResponse>("/api/health"),
  tasks:    () => request<TasksResponse>("/api/tasks"),
  finance:  () => request<FinanceResponse>("/api/finance"),
  activity: () => request<ActivityResponse>("/api/activity"),
  briefingStats: () => request<BriefingSummary>("/api/briefing"),

  logs: (n = 150) => request<LogsResponse>(`/api/logs?n=${n}`),

  // ── Approvals ───────────────────────────────────────────────────────────────
  approvals: () => request<ApprovalsResponse>("/api/approvals"),
  approve:   (stem: string) => post<OkResponse>("/api/approve", { stem }),
  reject:    (stem: string) => post<OkResponse>("/api/reject",  { stem }),

  // ── DRY_RUN ─────────────────────────────────────────────────────────────────
  getDryRun: ()              => request<{ dry_run: boolean }>("/api/dry-run"),
  setDryRun: (val: boolean)  => post<SetDryRunResponse>("/api/dry-run", { dry_run: val }),

  // ── Users (admin) ───────────────────────────────────────────────────────────
  users: () => request<UsersResponse>("/api/users"),

  // ── PM2 services ────────────────────────────────────────────────────────────
  restartService: (name: string) => post<OkResponse>("/api/service/restart", { name }),
  serviceLogs:    (name: string) => request<ServiceLogsResponse>(`/api/service/logs/${encodeURIComponent(name)}`),

  // ── Email ───────────────────────────────────────────────────────────────────
  emailTest: (to: string, subject: string, body: string) =>
    post<OkResponse>("/api/email/test", { to, subject, body }),
  emailSend: (to: string, subject: string, body: string) =>
    post<OkResponse>("/api/email/send", { to, subject, body }),

  // ── Social media ────────────────────────────────────────────────────────────
  socialHistory: () => request<SocialHistoryResponse>("/api/social/history"),
  postLinkedIn:  (content: string, dry_run: boolean) =>
    post<OkResponse>("/api/social/linkedin", { content, dry_run }),
  postTwitter:   (content: string, dry_run: boolean) =>
    post<OkResponse>("/api/social/twitter",  { content, dry_run }),
  postFacebook:  (content: string, dry_run: boolean) =>
    post<OkResponse>("/api/social/facebook", { content, dry_run }),

  // ── WhatsApp ────────────────────────────────────────────────────────────────
  whatsappStatus:  () => request<WhatsAppStatus>("/api/whatsapp/status"),
  whatsappPair:    () => post<OkResponse>("/api/whatsapp/pair", {}),
  whatsappMessage: (phone: string, message: string) =>
    post<OkResponse>("/api/whatsapp/message", { phone, message }),

  // ── Bank / Finance ──────────────────────────────────────────────────────────
  bankStatus: () => request<BankStatusResponse>("/api/bank/status"),
  bankTest:   () => post<OkResponse>("/api/bank/test", {}),
  bankUpload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    // Let the browser set the multipart boundary — omit Content-Type override
    const token = typeof window !== "undefined" ? localStorage.getItem("ai_employee_token") : null;
    return fetch(url("/api/bank/upload"), {
      method:  "POST",
      headers: token ? { "X-User-Token": token } : {},
      body:    form,
    }).then(r => r.json()) as Promise<OkResponse & { filename?: string }>;
  },

  // ── CEO Briefing ─────────────────────────────────────────────────────────────
  briefingGenerate: () => post<OkResponse>("/api/briefing/generate", {}),
  briefingVoice:    () => post<OkResponse>("/api/briefing/voice",    {}),
  briefingFiles:    () => request<BriefingFilesResponse>("/api/briefing/files"),
  briefingDownloadUrl: (filename: string) =>
    url(`/api/briefing/download/${encodeURIComponent(filename)}`),

  // ── RAG ──────────────────────────────────────────────────────────────────────
  ragQuery:   (query: string) => post<OkResponse & { stdout?: string }>("/api/rag/query",   { query }),
  ragReindex: ()               => post<OkResponse>("/api/rag/reindex", {}),
  ragStatus:  ()               => request<RagStatusResponse>("/api/rag/status"),

  // ── Webhooks ─────────────────────────────────────────────────────────────────
  webhookStatus: () => request<WebhookStatusResponse>("/api/webhook/status"),
  webhookTest:   () => post<OkResponse & { status?: number }>("/api/webhook/test", {}),
  webhookRecent: () => request<{ stats: WebhookStats }>("/api/webhook/recent"),

  // ── Demo mode ────────────────────────────────────────────────────────────────
  demoRun: (scenario: DemoScenario) =>
    post<DemoResponse>("/api/demo/run", { scenario }),
};

// ── safeCall ──────────────────────────────────────────────────────────────────
//
// Wraps any api.* call and returns { data, error } instead of throwing.
// Use when you want to handle success/failure inline without a React hook.
//
// Example:
//   const { data, error } = await safeCall(() => api.ragStatus());
//   if (error) { ... }

export type SafeResult<T> =
  | { data: T;    error: null   }
  | { data: null; error: string };

export async function safeCall<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (e) {
    return {
      data:  null,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
