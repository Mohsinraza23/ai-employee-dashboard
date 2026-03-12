import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ ok: true, message: "[DEMO] RAG reindex started — 312 documents queued" });
}
