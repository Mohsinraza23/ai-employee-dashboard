import { NextRequest, NextResponse } from "next/server";
import { getMockServiceLogs } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  return NextResponse.json(getMockServiceLogs(name));
}
