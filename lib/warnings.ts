/**
 * warnings.ts — centralised confirmation copy for every destructive action.
 *
 * ── Why this file exists ──────────────────────────────────────────────────────
 *
 * Warning copy is UX-critical. Inconsistent wording erodes user trust and
 * leads to accidental clicks. By sourcing all confirm options from one place:
 *
 *  • Copy is reviewed in a single diff
 *  • Severity levels are applied consistently
 *  • Impact lists are accurate to what the backend actually does
 *  • "danger + requireCheck + countdown" is used exactly where needed
 *
 * ── Severity guide ────────────────────────────────────────────────────────────
 *
 *  warning  requireCheck=false  — low-blast, easily reversed
 *           e.g. restart service, approve / reject task
 *
 *  warning  requireCheck=true   — medium-blast, reversible with effort
 *           e.g. reindex vault, generate briefing
 *
 *  danger   requireCheck=true   — high-blast, irreversible in real-time
 *           e.g. send email, post to social media
 *
 *  danger   requireCheck=true   — system-wide, affects all users
 *  countdown=5                    e.g. switch to LIVE mode
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *
 *   import { WARN } from "@/lib/warnings";
 *   const send = useAction(fn, { confirm: WARN.emailSend("user@example.com") });
 */

import type { ConfirmOptions } from "@/components/ui/confirm-dialog";
import { truncate } from "@/lib/utils";

// ── Email ─────────────────────────────────────────────────────────────────────

export const WARN = {

  emailSend: (to: string): ConfirmOptions => ({
    title:        "Send a real email?",
    body:         `A message will be delivered to ${to || "(no recipient set)"}.`,
    severity:     "danger",
    impact: [
      "Email lands in the recipient's inbox immediately",
      "Cannot be recalled or unsent after confirmation",
      "Replies will arrive in the monitored Gmail inbox",
    ],
    requireCheck: true,
    checkLabel:   "I confirm this sends a real email to a real person",
    confirmText:  "Send Email",
  }),

  // ── Social media ────────────────────────────────────────────────────────────

  linkedInPost: (preview: string): ConfirmOptions => ({
    title:        "Publish to LinkedIn?",
    body:         `"${truncate(preview, 100)}"`,
    severity:     "danger",
    impact: [
      "Post appears publicly on your LinkedIn profile",
      "Followers and connections are notified",
      "Cannot be deleted via this dashboard — use LinkedIn directly",
    ],
    requireCheck: true,
    checkLabel:   "I confirm this publishes publicly to LinkedIn",
    confirmText:  "Post to LinkedIn",
  }),

  twitterPost: (preview: string): ConfirmOptions => ({
    title:        "Publish to Twitter / X?",
    body:         `"${truncate(preview, 100)}"`,
    severity:     "danger",
    impact: [
      "Tweet appears immediately on your public timeline",
      "Followers receive notifications",
      "Deletion requires logging into Twitter/X directly",
    ],
    requireCheck: true,
    checkLabel:   "I confirm this tweets publicly",
    confirmText:  "Post Tweet",
  }),

  facebookPost: (preview: string): ConfirmOptions => ({
    title:        "Publish to Facebook?",
    body:         `"${truncate(preview, 100)}"`,
    severity:     "danger",
    impact: [
      "Post appears on your Facebook page or profile",
      "Followers and friends are notified",
      "Removal requires logging into Facebook directly",
    ],
    requireCheck: true,
    checkLabel:   "I confirm this publishes to Facebook",
    confirmText:  "Post to Facebook",
  }),

  // ── WhatsApp ─────────────────────────────────────────────────────────────────

  whatsappSend: (phone: string): ConfirmOptions => ({
    title:        "Send a WhatsApp message?",
    body:         `A message will be sent to ${phone || "(no number set)"}.`,
    severity:     "danger",
    impact: [
      "Message delivered to a real phone number immediately",
      "Recipient sees your WhatsApp account as the sender",
    ],
    requireCheck: true,
    checkLabel:   "I confirm this sends to a real WhatsApp number",
    confirmText:  "Send Message",
  }),

  // ── Services ─────────────────────────────────────────────────────────────────

  restartService: (name: string): ConfirmOptions => ({
    title:        `Restart ${name}?`,
    body:         "The service will restart. Active work may be interrupted for a few seconds.",
    severity:     "warning",
    impact: [
      "Service stops briefly before resuming",
      "In-flight tasks may be re-queued (idempotent behaviour)",
    ],
    requireCheck: false,
    confirmText:  "Restart Service",
  }),

  // ── Approvals ────────────────────────────────────────────────────────────────

  approveAction: (action: string): ConfirmOptions => ({
    title:        "Approve this action?",
    body:         truncate(action, 120),
    severity:     "warning",
    impact: [
      "Approval is recorded in the audit log",
      "The pending task proceeds to execution",
    ],
    requireCheck: false,
    confirmText:  "Approve",
  }),

  rejectAction: (action: string): ConfirmOptions => ({
    title:        "Reject this action?",
    body:         truncate(action, 120),
    severity:     "warning",
    impact: [
      "Action is permanently rejected",
      "After 3 rejections the task is escalated and locked",
    ],
    requireCheck: false,
    confirmText:  "Reject",
  }),

  // ── RAG / AI ─────────────────────────────────────────────────────────────────

  ragReindex: (): ConfirmOptions => ({
    title:        "Reindex the vault?",
    body:         "Crawls all markdown files and rebuilds the vector index. Runs in the background.",
    severity:     "warning",
    impact: [
      "CPU and disk I/O spike for ~30–90 seconds",
      "RAG queries may return stale results during indexing",
    ],
    requireCheck: false,
    confirmText:  "Start Reindex",
  }),

  // ── CEO Briefing ──────────────────────────────────────────────────────────────

  briefingGenerate: (): ConfirmOptions => ({
    title:        "Generate CEO Briefing?",
    body:         "Runs the briefing script now, bypassing the weekly schedule.",
    severity:     "warning",
    impact: [
      "Calls external AI API — uses credits",
      "Takes 30–120 seconds to complete",
      "Overwrites today's briefing file if one exists",
    ],
    requireCheck: true,
    checkLabel:   "I understand this uses AI credits",
    confirmText:  "Generate",
  }),

  briefingVoice: (): ConfirmOptions => ({
    title:        "Generate Voice MP3?",
    body:         "Converts the latest briefing to audio using text-to-speech.",
    severity:     "warning",
    impact: [
      "Uses TTS API credits",
      "Takes 20–60 seconds",
      "Overwrites the existing voice file",
    ],
    requireCheck: false,
    confirmText:  "Generate MP3",
  }),

  // ── System ───────────────────────────────────────────────────────────────────

  goLive: (): ConfirmOptions => ({
    title:        "Switch to LIVE mode?",
    body:         "In LIVE mode the system executes real-world actions immediately. This affects every user and every automated daemon.",
    severity:     "danger",
    countdown:    5,
    impact: [
      "Emails will be delivered to real recipients",
      "Social posts will publish to LinkedIn, Twitter, and Facebook",
      "WhatsApp messages will be sent to real phone numbers",
      "Bank and financial operations will execute live",
    ],
    requireCheck: true,
    checkLabel:   "I understand all actions are now real and cannot be undone",
    confirmText:  "Go LIVE",
  }),

} satisfies Record<string, (...args: never[]) => ConfirmOptions>;
