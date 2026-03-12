import { NextResponse } from "next/server";
import { getMockRagStatus } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockRagStatus());
}
