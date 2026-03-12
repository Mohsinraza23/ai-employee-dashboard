import { NextResponse } from "next/server";
import { getMockBankStatus } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockBankStatus());
}
