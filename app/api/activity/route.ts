import { NextResponse } from "next/server";
import { getMockActivity } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockActivity());
}
