import { NextRequest, NextResponse } from "next/server";

const DEMO_ANSWERS: Record<string, string> = {
  default: `Based on the vault contents (312 indexed documents):

**Recent Tasks**: 47 completed this week — mostly email replies (32) and social posts (8).

**Finance Summary**: Revenue PKR 850,000 | Expenses PKR 324,000 | Net PKR 526,000

**Pending Items**: 3 approvals awaiting human review (1 high-risk, 2 medium-risk).

**Key Actions This Week**:
• Invoice from TechVenture processed → Odoo INV-2026-012 created
• Partnership email from Ahmed Khan flagged for approval
• Bank anomaly detected: 3 round-amount transactions flagged
• WhatsApp message from Ali Hassan classified as partnership intent

*This is a demo response — connect a real vault to get live answers.*`,
};

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  const q = String(query).toLowerCase();
  let stdout = DEMO_ANSWERS.default;

  if (q.includes("email") || q.includes("gmail")) {
    stdout = "32 emails processed this week. Top intents: support (14), invoice (8), partnership (6), general (4). Auto-reply rate: 87.5%.";
  } else if (q.includes("finance") || q.includes("money") || q.includes("revenue")) {
    stdout = "March 2026 financials: Income PKR 850,000 (3 consulting fees + 1 retainer). Expenses PKR 324,000 (SaaS: 26%, Cloud: 13%, API: 58%, Misc: 3%). Net: PKR 526,000.";
  } else if (q.includes("approval") || q.includes("pending")) {
    stdout = "3 items pending approval: LinkedIn post (medium risk), Email reply to new sender Ahmed Khan (high risk), Twitter post (medium risk).";
  } else if (q.includes("whatsapp")) {
    stdout = "WhatsApp active — 8 messages received this week. 5 auto-replied (support/general), 2 escalated (partnership), 1 pending review.";
  }

  return NextResponse.json({ ok: true, stdout });
}
