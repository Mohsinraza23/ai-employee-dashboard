import { NextResponse } from "next/server";
import { getMockFinance } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockFinance());
}
