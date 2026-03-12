import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "[DEMO] Voice briefing generated: 2026-03-13_CEO_Briefing.mp3" });
}
