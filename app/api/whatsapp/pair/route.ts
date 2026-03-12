import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "[DEMO] Pairing code: 8A3F-K2P9. Enter in WhatsApp → Linked Devices." });
}
