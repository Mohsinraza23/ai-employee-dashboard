import { NextResponse } from "next/server";
import { getMockApprovals } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockApprovals());
}
