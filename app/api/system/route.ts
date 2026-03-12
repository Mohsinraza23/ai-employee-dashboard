import { NextResponse } from "next/server";
import { getMockSystem } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockSystem());
}
