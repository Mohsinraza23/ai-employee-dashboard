import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, status: 200, message: "[DEMO] Test webhook delivered successfully" });
}
