import { NextResponse } from "next/server";
import { getMockBriefingFiles } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockBriefingFiles());
}
