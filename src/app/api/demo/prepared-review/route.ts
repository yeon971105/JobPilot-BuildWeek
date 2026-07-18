import { NextResponse } from "next/server";
import { PREPARED_AMBIGUITY_REVIEW, PREPARED_ANALYSIS_CHALLENGE, PREPARED_REVIEW_BADGE, PREPARED_REVIEW_DISCLOSURE } from "@/lib/prepared-reviews";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { action?: "CHALLENGE" | "AMBIGUITY"; jobId?: string } | null;
  if (!body?.action || !body.jobId) return NextResponse.json({ error: "A supported action and jobId are required." }, { status: 400 });
  if (body.jobId !== "northstar-applied-ai-solutions-engineer") return NextResponse.json({ error: "Prepared review is available for the frozen Northstar demonstration role." }, { status: 404 });
  const artifact = body.action === "CHALLENGE" ? PREPARED_ANALYSIS_CHALLENGE : PREPARED_AMBIGUITY_REVIEW;
  return NextResponse.json({ review: artifact.output, provider: { mode: "CODEX_GPT56_PREPARED", model: "gpt-5.6-sol", live: false, label: PREPARED_REVIEW_BADGE, disclosure: PREPARED_REVIEW_DISCLOSURE, apiRequestCount: 0, modelGeneratedFinalScore: false } }, { headers: { "Cache-Control": "public, max-age=3600", "X-JobPilot-OpenAI-Requests": "0" } });
}
