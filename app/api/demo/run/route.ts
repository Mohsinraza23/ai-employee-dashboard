import { NextRequest, NextResponse } from "next/server";
import type { DemoScenario } from "@/types/api";

const SCENARIOS: Record<DemoScenario, { label: string; ok: boolean; detail: string }[]> = {
  email: [
    { label: "Fetch inbox",          ok: true,  detail: "Found 3 new emails" },
    { label: "Classify intent",      ok: true,  detail: "support(0.94), invoice(0.97), general(0.79)" },
    { label: "Draft replies",        ok: true,  detail: "3 replies drafted via Claude claude-haiku-4-5" },
    { label: "Risk assessment",      ok: true,  detail: "1 high-risk (new sender) → queued for approval" },
    { label: "Send approved replies",ok: true,  detail: "[DRY_RUN] 2 emails would be sent" },
  ],
  approval: [
    { label: "Scan pending files",   ok: true,  detail: "Found 3 items in Pending_Approval/" },
    { label: "Risk scoring",         ok: true,  detail: "high: 1, medium: 2, low: 0" },
    { label: "Check registry",       ok: true,  detail: "No escalated actions" },
    { label: "Notify dashboard",     ok: true,  detail: "Approval queue updated" },
  ],
  briefing: [
    { label: "Gather vault stats",   ok: true,  detail: "47 tasks, 32 emails, 8 posts" },
    { label: "Generate markdown",    ok: true,  detail: "2026-03-13_CEO_Briefing.md (8.4 KB)" },
    { label: "TTS synthesis",        ok: true,  detail: "[DRY_RUN] Voice briefing would be generated" },
    { label: "Deliver to vault",     ok: true,  detail: "Saved to AI_Employee_Vault/Briefings/" },
  ],
};

export async function POST(req: NextRequest) {
  const { scenario } = await req.json() as { scenario: DemoScenario };
  const steps = SCENARIOS[scenario] ?? SCENARIOS.email;
  return NextResponse.json({ ok: true, scenario, steps });
}
