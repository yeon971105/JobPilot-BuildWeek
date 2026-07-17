import { NextResponse } from "next/server";
import { buildLiveApplicationStrategy, fixtureStrategy, getDemoProviderConfig } from "@/server/build-week/strategy";

const budget = new Map<string, { count: number; day: string }>();
const DAILY_LIMIT = 12;

function getIp(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local-demo"; }
function allowed(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  const entry = budget.get(ip);
  const current = entry?.day === day ? entry : { count: 0, day };
  if (current.count >= DAILY_LIMIT) return false;
  current.count += 1; budget.set(ip, current); return true;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { jobId?: string; mode?: "live" | "fixture" } | null;
  if (!body?.jobId) return NextResponse.json({ error: "jobId is required." }, { status: 400 });
  if (!allowed(getIp(request))) return NextResponse.json({ error: "The demo AI quota is reached for today. Please try again tomorrow." }, { status: 429 });
  const config = getDemoProviderConfig();
  try {
    if (body.mode === "fixture") return NextResponse.json({ strategy: fixtureStrategy(body.jobId), provider: { mode: "FIXTURE_ONLY", model: "deterministic-demo-fixture", live: false } });
    const strategy = await buildLiveApplicationStrategy(body.jobId);
    return NextResponse.json({ strategy, provider: config });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI analysis is temporarily unavailable. No result was generated.", provider: config }, { status: 503 });
  }
}
