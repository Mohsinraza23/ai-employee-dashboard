// ─────────────────────────────────────────────────────────────────────────────
// API response types — mirrors every Flask endpoint's jsonify() shape.
// Keep in sync with dashboard/app.py.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared primitives ────────────────────────────────────────────────────────

export type OkResponse  = { ok: true;  message?: string };
export type ErrResponse = { ok: false; error: string };
export type ApiResult<T> = T | ErrResponse;

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  ok:       true;
  token:    string;
  username: string;
  role:     "admin" | "user";
}

export interface MeResponse {
  ok:       true;
  username: string;
  role:     "admin" | "user";
  is_admin: boolean;
}

// ── System / PM2 ─────────────────────────────────────────────────────────────

export type ProcessHealth = "ok" | "warn" | "error" | "unknown";

export interface Process {
  name:       string;
  /** Raw PM2 status string — prefer pm2_status */
  status:     "online" | "stopped" | "errored" | "launching" | "pm2_not_found" | string;
  /** Canonical field returned by /api/system route */
  pm2_status: string;
  pid:        number | null;
  uptime:     string;
  restarts:   number;
  /** Memory in bytes (from PM2 monit.memory) */
  memory:     number;
  cpu:        number;   // percent
  health:     ProcessHealth;
  log_out:    string;
  log_err:    string;
}

export interface SystemResponse {
  processes: Process[];
  total:     number;
  online:    number;
  dry_run:   boolean;
  timestamp: string;
}

export interface ServiceLogsResponse {
  ok:    true;
  name:  string;
  lines: string[];
  path:  string;
}

// ── Health (psutil) ───────────────────────────────────────────────────────────

export interface LogSize { name: string; size_mb: number }

export interface HealthResponse {
  cpu:             number;
  ram_pct:         number;
  ram_used_mb:     number;
  ram_total_mb:    number;
  disk_pct:        number;
  disk_used_gb:    number;
  disk_total_gb:   number;
  log_sizes:       LogSize[];
  circuit_breakers: Record<string, unknown>;
}

// ── Tasks / Vault pipeline ────────────────────────────────────────────────────

export interface RecentTask {
  name:       string;
  intent:     string;
  confidence: number;
  status:     string;
  modified:   string;
}

export interface TasksResponse {
  inbox:        number;
  needs_action: number;
  needs_review: number;
  done:         number;
  errors:       number;
  recent:       RecentTask[];
  /** Alias for convenience — same as recent */
  tasks?:       RecentTask[];
}

// ── Approvals ─────────────────────────────────────────────────────────────────

export interface Approval {
  stem:        string;
  type?:       string;
  platform?:   string;
  risk?:       string;
  created?:    string;
  created_at?: string;   // alias used in some views
  user?:       string;
  content?:    string;
  action?:     string;
  description?: string;
}

/** Convenience alias */
export type ApprovalItem = Approval;

export interface ApprovalsResponse {
  approvals: Approval[];
  count:     number;
}

// ── Finance ───────────────────────────────────────────────────────────────────

export interface FinanceTransaction {
  date:        string;
  description: string;
  amount:      number;
  type:        "income" | "expense";
}

export interface FinanceResponse {
  month:         string;
  income:        number;
  /** Flask returns "expense" (singular) */
  expense?:      number;
  /** Alias — some Flask route versions return plural */
  expenses?:     number;
  net:           number;
  /** Alias for net — used by KPI grid */
  net_balance?:  number;
  /** Current month's spend */
  monthly_spend?: number;
  /** Flask returns "entries"; transactions is an alias */
  entries?:       FinanceTransaction[];
  transactions?:  FinanceTransaction[];
  /** Raw audit CSV rows */
  audit_rows?:    Record<string, unknown>[];
  alerts?:        string[];
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export interface LogLine {
  ts:    string;
  level: "INFO" | "WARNING" | "ERROR" | "DEBUG";
  msg:   string;
}

export interface LogsResponse {
  /** Lines may be plain strings OR LogLine objects depending on Flask route version */
  lines: (LogLine | string)[];
  total: number;
}

// ── Activity ──────────────────────────────────────────────────────────────────

export interface ActivityDay {
  date:   string;
  tasks:  number;
  emails: number;
  posts:  number;
}

export interface ActivityEvent {
  ts:      string;
  message: string;
  level?:  string;
}

export interface ActivityResponse {
  events?: ActivityEvent[];
  days?:   ActivityDay[];
}

// ── Briefing ──────────────────────────────────────────────────────────────────

export interface BriefingSummary {
  title:              string;
  period:             string;
  generated:          string;
  tasks_completed:    number;
  emails_sent:        number;
  social_posts:       number;
  pending_approvals:  number;
  open_errors:        number;
  revenue:            string;
  expenses:           string;
}

export interface BriefingFile {
  name:  string;
  type:  "md" | "mp3";
  size:  number;
  mtime: string;
}

export interface BriefingFilesResponse {
  ok:    true;
  files: BriefingFile[];
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export interface WhatsAppStatus {
  ok:        true;
  connected: boolean;
  pm2:       Process | null;
}

// ── Bank ──────────────────────────────────────────────────────────────────────

export interface BankStatusResponse {
  ok:             true;
  pm2:            Process | null;
  last_report:    string | null;
  csv_count:      number;
  recent_reports: Array<{ name: string; mtime: string }>;
}

// ── Social ────────────────────────────────────────────────────────────────────

export interface SocialHistoryEntry {
  ts:  string;
  msg: string;
}

export interface SocialHistoryResponse {
  history: SocialHistoryEntry[];
}

// ── RAG ───────────────────────────────────────────────────────────────────────

export interface RagStatusResponse {
  ok:       true;
  running:  boolean;
  last_run: string | null;
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export interface WebhookStats {
  github?:        number;
  GitHub?:        number;
  stripe?:        number;
  Stripe?:        number;
  calendly?:      number;
  Calendly?:      number;
  custom?:        number;
  Custom?:        number;
  recent_events?: Array<{ source: string; event: string; ts: string }>;
}

export interface WebhookStatusResponse {
  ok:    true;
  pm2:   Process | null;
  stats: WebhookStats;
  port:  number;
}

// ── Demo ──────────────────────────────────────────────────────────────────────

export type DemoScenario = "email" | "approval" | "briefing";

export interface DemoStep {
  label:  string;
  ok:     boolean;
  detail: string;
}

export interface DemoResponse {
  ok:       boolean;
  scenario: DemoScenario;
  steps:    DemoStep[];
}

// ── Users (admin) ─────────────────────────────────────────────────────────────

export interface User {
  username:      string;
  role:          "admin" | "user";
  vault_exists:  boolean;
  pending_count: number;
}

export interface UsersResponse {
  ok:    true;
  users: User[];
  count: number;
}

// ── DRY_RUN ───────────────────────────────────────────────────────────────────

export interface DryRunResponse { dry_run: boolean }
export interface SetDryRunResponse { ok: boolean; dry_run: boolean }
