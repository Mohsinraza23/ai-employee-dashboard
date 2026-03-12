import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "[DEMO] CEO Briefing generated: 2026-03-13_CEO_Briefing.md" });
}
