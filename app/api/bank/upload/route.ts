import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const name = file?.name ?? "transactions.csv";
  return NextResponse.json({ ok: true, filename: name, message: `[DEMO] Uploaded: ${name} — anomaly scan queued` });
}
