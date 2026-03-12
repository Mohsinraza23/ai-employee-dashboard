import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { content, dry_run } = await req.json();
  const preview = String(content).slice(0, 60);
  const mode = dry_run ? "[DRY_RUN]" : "[DEMO]";
  return NextResponse.json({ ok: true, message: `${mode} Facebook post published: "${preview}…"` });
}
