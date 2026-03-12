import { NextRequest, NextResponse } from "next/server";
import { approveItem } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const { stem } = await req.json();
  approveItem(stem);
  return NextResponse.json({ ok: true, message: `Approved: ${stem}` });
}
