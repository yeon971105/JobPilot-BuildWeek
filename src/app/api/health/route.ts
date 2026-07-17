import { NextResponse } from "next/server";
import { getDemoProviderConfig } from "@/server/build-week/strategy";

export async function GET() {
  const provider = getDemoProviderConfig();
  return NextResponse.json({ status: "ok", service: "JobPilot Build Week demo", provider, syntheticDemo: true, timestamp: new Date().toISOString() });
}
