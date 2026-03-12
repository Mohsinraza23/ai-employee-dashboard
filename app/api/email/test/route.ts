import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { to, subject } = await req.json();
  return NextResponse.json({ ok: true, message: `[DEMO] Test email to ${to} — Subject: ${subject}` });
}
