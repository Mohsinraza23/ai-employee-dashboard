import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { phone, message } = await req.json();
  const preview = String(message).slice(0, 50);
  return NextResponse.json({ ok: true, message: `[DEMO] WhatsApp message sent to ${phone}: "${preview}…"` });
}
