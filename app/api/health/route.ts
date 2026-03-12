import { NextResponse } from "next/server";
import { getMockHealth } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockHealth());
}
