import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  return NextResponse.json({ ok: true, message: `[DEMO] Service "${name}" restarted successfully` });
}
