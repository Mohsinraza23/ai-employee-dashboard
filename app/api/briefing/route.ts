import { NextResponse } from "next/server";
import { getMockBriefingSummary } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockBriefingSummary());
}
