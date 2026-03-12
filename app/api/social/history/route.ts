import { NextResponse } from "next/server";
import { getMockSocialHistory } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockSocialHistory());
}
