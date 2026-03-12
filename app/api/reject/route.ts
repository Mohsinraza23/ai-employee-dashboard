import { NextRequest, NextResponse } from "next/server";
import { rejectItem } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { stem } = await req.json();
  rejectItem(stem);
  return NextResponse.json({ ok: true, message: `Rejected: ${stem}` });
}
