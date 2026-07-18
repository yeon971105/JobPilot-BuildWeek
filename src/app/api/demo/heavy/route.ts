import { NextResponse } from "next/server";
import { PREPARED_ANALYSIS_CHALLENGE, PREPARED_REVIEW_BADGE, PREPARED_REVIEW_DISCLOSURE } from "@/lib/prepared-reviews";
import { challengeLiveAnalysis, fixtureChallenge, getDemoProviderConfig } from "@/server/build-week/strategy";

const dailyBudget = new Map<string, { day: string; count: number }>();
const DAILY_LIMIT = 8;
function clientId(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local-demo"; }
function consume(id: string) { const day = new Date().toISOString().slice(0, 10); const prior = dailyBudget.get(id); const current = prior?.day === day ? prior : { day, count: 0 }; if (current.count >= DAILY_LIMIT) return false; current.count += 1; dailyBudget.set(id, current); return true; }

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 8_192) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  const body = await request.json().catch(() => null) as { jobId?: string; action?: "CHALLENGE_ANALYSIS"; mode?: "live" | "fixture" } | null;
  if (!body?.jobId || body.action !== "CHALLENGE_ANALYSIS") return NextResponse.json({ error: "A supported action and jobId are required." }, { status: 400 });
  if (!consume(clientId(request))) return NextResponse.json({ error: "The heavy-reasoning demo quota is reached for today." }, { status: 429 });
  const provider = getDemoProviderConfig();
  try {
    if (body.jobId === "northstar-applied-ai-solutions-engineer" && (body.mode === "fixture" || provider.mode !== "OPENAI_GPT56_HEAVY")) return NextResponse.json({ challenge: PREPARED_ANALYSIS_CHALLENGE.output, provider: { mode: "CODEX_GPT56_PREPARED", model: "gpt-5.6-sol", live: false, label: PREPARED_REVIEW_BADGE, disclosure: PREPARED_REVIEW_DISCLOSURE, apiRequestCount: 0 } });
    if (body.mode === "fixture" || provider.mode !== "OPENAI_GPT56_HEAVY") return NextResponse.json({ challenge: fixtureChallenge(body.jobId), provider: { mode: "FIXTURE_ONLY", model: "prepared-demonstration-output", live: false } });
    return NextResponse.json({ challenge: await challengeLiveAnalysis(body.jobId), provider });
  } catch { return NextResponse.json({ error: "AI analysis is temporarily unavailable. No result was generated.", provider }, { status: 503 }); }
}
