import { NextResponse } from "next/server";
import { getMockWebhookStatus } from "@/lib/mock-data";

export async function GET() {
  const { stats } = getMockWebhookStatus();
  return NextResponse.json({ stats });
}
