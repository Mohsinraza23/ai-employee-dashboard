import { NextResponse } from "next/server";
import { getMockWhatsApp } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(getMockWhatsApp());
}
