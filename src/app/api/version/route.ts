import { NextResponse } from "next/server";
import { getBuildVersion } from "@/server/build-week/version";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(getBuildVersion(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
