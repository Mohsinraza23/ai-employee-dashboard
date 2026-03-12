import { NextResponse } from "next/server";
import { getMockUsers } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockUsers());
}
