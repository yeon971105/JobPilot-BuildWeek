import { NextResponse } from "next/server";
import { getPublicProviderStatus } from "@/server/build-week/providers";

export async function GET() {
  return NextResponse.json(getPublicProviderStatus());
}
