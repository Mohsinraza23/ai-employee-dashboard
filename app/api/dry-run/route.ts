import { NextRequest, NextResponse } from "next/server";
import { getDryRun, setDryRun } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ dry_run: getDryRun() });
}

export async function POST(req: NextRequest) {
  const { dry_run } = await req.json();
  setDryRun(Boolean(dry_run));
  return NextResponse.json({ ok: true, dry_run: getDryRun() });
}
