// Mock data for demo/Vercel deployment — all features work without Flask backend

import type {
  SystemResponse, HealthResponse, TasksResponse, ApprovalsResponse,
  FinanceResponse, ActivityResponse, LogsResponse, BriefingSummary,
  BriefingFilesResponse, WhatsAppStatus, BankStatusResponse,
  SocialHistoryResponse, RagStatusResponse, WebhookStatusResponse,
  MeResponse, UsersResponse, ServiceLogsResponse,
} from "@/types/api";

// ── Shared mock process helper ────────────────────────────────────────────────

export function mockProcess(name: string, status = "online", mem = 40, restarts = 0) {
  return {
    name,
    status,
    pm2_status: status,
    pid: status === "online" ? 1000 + Math.floor(Math.random() * 9000) : null,
    uptime: status === "online" ? "2h 34m" : "—",
    restarts,
    memory: mem * 1024 * 1024,
    cpu: status === "online" ? Math.random() * 4 : 0,
    health: (status === "online" ? "ok" : status === "errored" ? "error" : "warn") as "ok"|"warn"|"error",
    log_out: `logs/pm2-${name}-out.log`,
    log_err: `logs/pm2-${name}-err.log`,
  };
}

// ── System ────────────────────────────────────────────────────────────────────

export function getMockSystem(): SystemResponse {
  const processes = [
    mockProcess("orchestrator",       "online",  62,  0),
    mockProcess("vault-watcher",      "online",  28,  0),
    mockProcess("gmail-watcher",      "online",  74,  1),
    mockProcess("gmail-pubsub",       "online",  45,  0),
    mockProcess("bank-watcher",       "online",  31,  0),
    mockProcess("webhook-receiver",   "online",  88,  0),
    mockProcess("whatsapp-watcher",   "online",  55,  2),
    mockProcess("vault-rag-watcher",  "stopped", 0,   0),
    mockProcess("ceo-briefing-weekly","stopped", 0,   0),
    mockProcess("vault-sync",         "online",  18,  0),
    mockProcess("watchdog",           "online",  22,  0),
  ];
  const online = processes.filter(p => p.pm2_status === "online").length;
  return {
    processes,
    total: processes.length,
    online,
    dry_run: true,
    timestamp: new Date().toISOString(),
  };
}

// ── Health ────────────────────────────────────────────────────────────────────

export function getMockHealth(): HealthResponse {
  return {
    cpu: 12.4,
    ram_pct: 38.2,
    ram_used_mb: 3124,
    ram_total_mb: 8192,
    disk_pct: 54.1,
    disk_used_gb: 86.5,
    disk_total_gb: 160,
    log_sizes: [
      { name: "actions.log",      size_mb: 2.4  },
      { name: "pm2-orchestrator", size_mb: 0.8  },
      { name: "pm2-gmail",        size_mb: 1.2  },
      { name: "webhook_stats",    size_mb: 0.3  },
    ],
    circuit_breakers: { gmail: "closed", linkedin: "closed", twitter: "closed" },
  };
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function getMockTasks(): TasksResponse {
  return {
    inbox: 3,
    needs_action: 2,
    needs_review: 1,
    done: 47,
    errors: 2,
    recent: [
      { name: "EMAIL_20260313_092341.md",    intent: "support",     confidence: 0.94, status: "done",        modified: "2026-03-13T09:23:41Z" },
      { name: "WHATSAPP_ali_20260313.md",    intent: "partnership", confidence: 0.88, status: "needs_review", modified: "2026-03-13T08:55:12Z" },
      { name: "EMAIL_20260312_174502.md",    intent: "invoice",     confidence: 0.97, status: "done",        modified: "2026-03-12T17:45:02Z" },
      { name: "EMAIL_20260312_110023.md",    intent: "general",     confidence: 0.79, status: "done",        modified: "2026-03-12T11:00:23Z" },
      { name: "BANK_ALERT_20260311.md",      intent: "finance",     confidence: 1.00, status: "done",        modified: "2026-03-11T23:10:05Z" },
    ],
  };
}

// ── Approvals ─────────────────────────────────────────────────────────────────

const INITIAL_APPROVALS = [
  {
    stem:        "approval_20260313_091500_LinkedInPost",
    type:        "social",
    platform:    "LinkedIn",
    risk:        "medium",
    created:     "2026-03-13T09:15:00Z",
    created_at:  "2026-03-13T09:15:00Z",
    user:        "admin",
    content:     "Excited to share our Q1 2026 results — revenue up 34% YoY! 🚀 Full breakdown in the link below. #startups #growth",
    action:      "post_linkedin",
    description: "LinkedIn post about Q1 results",
  },
  {
    stem:        "approval_20260313_084200_EmailReply",
    type:        "email",
    platform:    "Gmail",
    risk:        "high",
    created:     "2026-03-13T08:42:00Z",
    created_at:  "2026-03-13T08:42:00Z",
    user:        "admin",
    content:     "Dear Ahmed, Thank you for reaching out. We'd be happy to discuss a potential partnership...",
    action:      "send_email",
    description: "Reply to partnership proposal from Ahmed Khan (new sender)",
  },
  {
    stem:        "approval_20260312_172300_TwitterPost",
    type:        "social",
    platform:    "Twitter",
    risk:        "medium",
    created:     "2026-03-12T17:23:00Z",
    created_at:  "2026-03-12T17:23:00Z",
    user:        "admin",
    content:     "Just automated our entire operations workflow with @AnthropicAI Claude Code. 11 daemons, 22 skills, zero manual tasks. Thread 🧵",
    action:      "post_twitter",
    description: "Tweet about AI Employee launch",
  },
];

// In-memory state (resets on cold start — fine for demo)
let _approvals = [...INITIAL_APPROVALS];
let _dryRun    = true;

export function getMockApprovals(): ApprovalsResponse {
  return { approvals: _approvals, count: _approvals.length };
}

export function approveItem(stem: string) {
  _approvals = _approvals.filter(a => a.stem !== stem);
}

export function rejectItem(stem: string) {
  _approvals = _approvals.filter(a => a.stem !== stem);
}

export function getDryRun()          { return _dryRun; }
export function setDryRun(v: boolean){ _dryRun = v;    }

// ── Finance ───────────────────────────────────────────────────────────────────

export function getMockFinance(): FinanceResponse {
  return {
    month:    "2026-03",
    income:   8500,
    expense:  3240,
    expenses: 3240,
    net:      5260,
    net_balance:   5260,
    monthly_spend: 3240,
    entries: [
      { date: "2026-03-13", description: "Consulting fee — TechVenture",  amount:  3500, type: "income"  },
      { date: "2026-03-12", description: "SaaS subscriptions (annual)",   amount:  -840, type: "expense" },
      { date: "2026-03-11", description: "Freelance project — UI design", amount:  2000, type: "income"  },
      { date: "2026-03-10", description: "Cloud infra (AWS + Vercel)",    amount:  -420, type: "expense" },
      { date: "2026-03-09", description: "Invoice #INV-2026-012",         amount:  3000, type: "income"  },
      { date: "2026-03-08", description: "Office supplies",               amount:   -85, type: "expense" },
      { date: "2026-03-07", description: "API credits (Anthropic)",       amount: -1895, type: "expense" },
      { date: "2026-03-05", description: "Retainer — Smith & Co",         amount:  2500, type: "income"  },
    ],
    alerts: [],
  };
}

// ── Activity ──────────────────────────────────────────────────────────────────

export function getMockActivity(): ActivityResponse {
  const events = [
    { ts: "2026-03-13T09:23:41Z", message: "Email from support@stripe.com → intent: invoice → auto-replied ✓",   level: "INFO" },
    { ts: "2026-03-13T09:15:00Z", message: "LinkedIn post queued for approval (risk: medium)",                    level: "INFO" },
    { ts: "2026-03-13T08:55:12Z", message: "WhatsApp message from Ali Hassan → partnership intent detected",      level: "INFO" },
    { ts: "2026-03-13T08:42:00Z", message: "Email reply to ahmed@example.com flagged as high-risk — pending approval", level: "WARNING" },
    { ts: "2026-03-13T08:00:00Z", message: "Bank CSV uploaded: transactions_mar2026.csv (238 rows processed)",    level: "INFO" },
    { ts: "2026-03-13T07:00:00Z", message: "Vault RAG reindex completed — 312 documents indexed",                level: "INFO" },
    { ts: "2026-03-12T23:10:05Z", message: "Bank anomaly detected: ROUND_AMOUNT_FLAG on 3 transactions",         level: "WARNING" },
    { ts: "2026-03-12T22:00:00Z", message: "Weekly CEO Briefing generated and delivered",                        level: "INFO" },
    { ts: "2026-03-12T17:45:02Z", message: "Invoice email processed → Odoo record created #INV-2026-012",        level: "INFO" },
    { ts: "2026-03-12T15:30:00Z", message: "Webhook received: Stripe charge.succeeded ($299.00)",                level: "INFO" },
  ];
  const days = [
    { date: "2026-03-13", tasks: 5,  emails: 8,  posts: 1 },
    { date: "2026-03-12", tasks: 9,  emails: 14, posts: 3 },
    { date: "2026-03-11", tasks: 6,  emails: 10, posts: 2 },
    { date: "2026-03-10", tasks: 11, emails: 18, posts: 4 },
    { date: "2026-03-09", tasks: 4,  emails: 6,  posts: 1 },
    { date: "2026-03-08", tasks: 3,  emails: 5,  posts: 0 },
    { date: "2026-03-07", tasks: 7,  emails: 12, posts: 2 },
  ];
  return { events, days };
}

// ── Logs ──────────────────────────────────────────────────────────────────────

export function getMockLogs(): LogsResponse {
  const lines = [
    { ts: "2026-03-13T09:23:41Z", level: "INFO"    as const, msg: "[vault-watcher] New file detected: EMAIL_20260313_092341.md" },
    { ts: "2026-03-13T09:23:42Z", level: "INFO"    as const, msg: "[task-planner] Classifying intent for EMAIL_20260313_092341.md" },
    { ts: "2026-03-13T09:23:43Z", level: "INFO"    as const, msg: "[task-planner] Intent: support (confidence: 0.94)" },
    { ts: "2026-03-13T09:23:44Z", level: "INFO"    as const, msg: "[ralph-wiggum] Executing skill: gmail-send" },
    { ts: "2026-03-13T09:23:45Z", level: "INFO"    as const, msg: "[gmail-send] DRY_RUN=true — email not sent" },
    { ts: "2026-03-13T09:15:00Z", level: "INFO"    as const, msg: "[approval] Created: approval_20260313_091500_LinkedInPost.pending" },
    { ts: "2026-03-13T08:55:12Z", level: "INFO"    as const, msg: "[whatsapp-watcher] Message from +923001234567 — partnership" },
    { ts: "2026-03-13T08:42:00Z", level: "WARNING" as const, msg: "[human-approval] High-risk action flagged: EmailReply to new sender" },
    { ts: "2026-03-13T08:00:05Z", level: "INFO"    as const, msg: "[bank-watcher] Processed: transactions_mar2026.csv" },
    { ts: "2026-03-13T08:00:06Z", level: "WARNING" as const, msg: "[bank-watcher] Anomaly: ROUND_AMOUNT_FLAG on txn #0042, #0087, #0134" },
    { ts: "2026-03-13T07:00:10Z", level: "INFO"    as const, msg: "[vault-rag] Reindex complete — 312 docs, 0 errors" },
    { ts: "2026-03-12T23:10:05Z", level: "WARNING" as const, msg: "[bank-watcher] CEO alert queued: anomaly severity=medium" },
    { ts: "2026-03-12T22:00:00Z", level: "INFO"    as const, msg: "[ceo-briefing] Weekly briefing generated: 2026-03-12_CEO_Briefing.md" },
    { ts: "2026-03-12T17:45:02Z", level: "INFO"    as const, msg: "[gmail-watcher] Invoice email → Odoo invoice created #INV-2026-012" },
    { ts: "2026-03-12T15:30:00Z", level: "INFO"    as const, msg: "[webhook-receiver] Stripe charge.succeeded — $299.00" },
  ];
  return { lines, total: lines.length };
}

// ── Briefing ──────────────────────────────────────────────────────────────────

export function getMockBriefingSummary(): BriefingSummary {
  return {
    title:             "Weekly CEO Briefing — Week 11, 2026",
    period:            "2026-03-06 → 2026-03-12",
    generated:         "2026-03-12T22:00:00Z",
    tasks_completed:   47,
    emails_sent:       32,
    social_posts:      8,
    pending_approvals: 3,
    open_errors:       2,
    revenue:           "PKR 850,000",
    expenses:          "PKR 324,000",
  };
}

export function getMockBriefingFiles(): BriefingFilesResponse {
  return {
    ok: true,
    files: [
      { name: "2026-03-12_CEO_Briefing.md",  type: "md",  size: 8420,  mtime: "2026-03-12T22:00:00Z" },
      { name: "2026-03-12_CEO_Briefing.mp3", type: "mp3", size: 184320, mtime: "2026-03-12T22:01:15Z" },
      { name: "2026-03-05_CEO_Briefing.md",  type: "md",  size: 7840,  mtime: "2026-03-05T22:00:00Z" },
      { name: "2026-03-05_CEO_Briefing.mp3", type: "mp3", size: 176128, mtime: "2026-03-05T22:01:02Z" },
    ],
  };
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────

export function getMockWhatsApp(): WhatsAppStatus {
  return {
    ok:        true,
    connected: true,
    pm2:       mockProcess("whatsapp-watcher", "online", 55, 2),
  };
}

// ── Bank ──────────────────────────────────────────────────────────────────────

export function getMockBankStatus(): BankStatusResponse {
  return {
    ok:          true,
    pm2:         mockProcess("bank-watcher", "online", 31, 0),
    last_report: "2026-03-13T08:00:06Z",
    csv_count:   3,
    recent_reports: [
      { name: "Bank_Anomaly_20260313_080006.md", mtime: "2026-03-13T08:00:06Z" },
      { name: "Bank_Anomaly_20260311_231005.md", mtime: "2026-03-11T23:10:05Z" },
      { name: "Bank_Anomaly_20260307_140022.md", mtime: "2026-03-07T14:00:22Z" },
    ],
  };
}

// ── Social ────────────────────────────────────────────────────────────────────

export function getMockSocialHistory(): SocialHistoryResponse {
  return {
    history: [
      { ts: "2026-03-12T15:00:00Z", msg: "[DRY_RUN] LinkedIn: Excited to share Q1 results — revenue up 34% YoY! 🚀" },
      { ts: "2026-03-11T10:30:00Z", msg: "[DRY_RUN] Twitter: Just automated our entire operations workflow with @AnthropicAI Claude Code 🧵" },
      { ts: "2026-03-10T09:00:00Z", msg: "[LIVE] Facebook: Check out our latest case study on AI-powered business automation" },
      { ts: "2026-03-09T14:00:00Z", msg: "[LIVE] LinkedIn: Hiring! Looking for a senior full-stack engineer. DM to apply 🚀" },
      { ts: "2026-03-07T11:00:00Z", msg: "[LIVE] Twitter: AI Employee v2.0 shipped with WhatsApp Baileys + Gmail Pub/Sub 🎉" },
    ],
  };
}

// ── RAG ───────────────────────────────────────────────────────────────────────

export function getMockRagStatus(): RagStatusResponse {
  return { ok: true, running: false, last_run: "2026-03-13T07:00:10Z" };
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export function getMockWebhookStatus(): WebhookStatusResponse {
  return {
    ok:   true,
    pm2:  mockProcess("webhook-receiver", "online", 88, 0),
    port: 5002,
    stats: {
      GitHub:   24,
      Stripe:   38,
      Calendly: 12,
      Custom:   7,
      recent_events: [
        { source: "Stripe",   event: "charge.succeeded",        ts: "2026-03-13T09:28:00Z" },
        { source: "GitHub",   event: "push",                    ts: "2026-03-13T09:12:00Z" },
        { source: "Calendly", event: "invitee.created",         ts: "2026-03-13T08:30:00Z" },
        { source: "Stripe",   event: "invoice.payment_succeeded", ts: "2026-03-12T17:45:00Z" },
        { source: "GitHub",   event: "pull_request.opened",     ts: "2026-03-12T16:00:00Z" },
      ],
    },
  };
}

// ── Me / Users ────────────────────────────────────────────────────────────────

export function getMockMe(): MeResponse {
  return { ok: true, username: "demo", role: "admin", is_admin: true };
}

export function getMockUsers(): UsersResponse {
  return {
    ok:    true,
    count: 2,
    users: [
      { username: "demo",  role: "admin", vault_exists: true, pending_count: 3 },
      { username: "alice", role: "user",  vault_exists: true, pending_count: 0 },
    ],
  };
}

// ── Service Logs ──────────────────────────────────────────────────────────────

export function getMockServiceLogs(name: string): ServiceLogsResponse {
  return {
    ok:   true,
    name,
    path: `logs/pm2-${name}-out.log`,
    lines: [
      `[2026-03-13T09:23:41Z] [${name}] Starting up...`,
      `[2026-03-13T09:23:42Z] [${name}] Connected to vault at AI_Employee_Vault/`,
      `[2026-03-13T09:23:43Z] [${name}] Watching for changes...`,
      `[2026-03-13T09:25:00Z] [${name}] Processed 1 item from Inbox/`,
      `[2026-03-13T09:30:00Z] [${name}] Heartbeat OK — uptime 6m 17s`,
      `[2026-03-13T09:35:00Z] [${name}] Heartbeat OK — uptime 11m 17s`,
    ],
  };
}
