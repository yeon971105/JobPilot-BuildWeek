import { z } from "zod";
import { DEMO_CANDIDATE, getDemoAnalysis, getDemoJob } from "@/lib/build-week-demo";

export const DEMO_PROVIDER_VERSION = "jobpilot-build-week-gpt56-v1";
export type DemoProviderMode = "PRIVATE_LOCAL" | "BUILD_WEEK_GPT56" | "FIXTURE_ONLY";

const strategySchema = z.object({
  strongestFitEvidence: z.array(z.object({ requirementId: z.string(), evidenceId: z.string(), explanation: z.string().min(1).max(360) })).max(4),
  truthfulGaps: z.array(z.object({ requirementId: z.string(), explanation: z.string().min(1).max(360) })).max(4),
  resumeEmphasis: z.array(z.object({ evidenceId: z.string(), recommendation: z.string().min(1).max(360) })).max(4),
  interviewTopics: z.array(z.object({ requirementId: z.string(), topic: z.string().min(1).max(240) })).max(4),
  researchQuestions: z.array(z.string().min(1).max(240)).max(4),
  recommendation: z.enum(["APPLY", "REVIEW", "SKIP"]),
  rationale: z.string().min(1).max(480),
});
export type ApplicationStrategy = z.infer<typeof strategySchema>;

type DemoProviderEnvironment = Partial<Pick<NodeJS.ProcessEnv, "AI_PROVIDER" | "BUILD_WEEK_DEMO_MODE" | "BUILD_WEEK_ALLOW_LIVE_GPT56" | "OPENAI_API_KEY" | "OPENAI_BUILD_WEEK_MODEL" | "OLLAMA_MODEL">>;

export function getDemoProviderConfig(env: DemoProviderEnvironment = process.env) {
  const requested = env.AI_PROVIDER?.trim().toUpperCase();
  const liveEnabled = env.BUILD_WEEK_DEMO_MODE === "true" && env.BUILD_WEEK_ALLOW_LIVE_GPT56 === "true" && Boolean(env.OPENAI_API_KEY?.trim());
  if (requested === "PRIVATE_LOCAL") return { mode: "PRIVATE_LOCAL" as const, model: env.OLLAMA_MODEL?.trim() || "gemma4:12b", live: false };
  if (liveEnabled) return { mode: "BUILD_WEEK_GPT56" as const, model: env.OPENAI_BUILD_WEEK_MODEL?.trim() || "gpt-5.6-terra", live: true };
  return { mode: "FIXTURE_ONLY" as const, model: "deterministic-demo-fixture", live: false };
}

function schema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["strongestFitEvidence", "truthfulGaps", "resumeEmphasis", "interviewTopics", "researchQuestions", "recommendation", "rationale"],
    properties: {
      strongestFitEvidence: { type: "array", maxItems: 4, items: { type: "object", additionalProperties: false, required: ["requirementId", "evidenceId", "explanation"], properties: { requirementId: { type: "string" }, evidenceId: { type: "string" }, explanation: { type: "string" } } } },
      truthfulGaps: { type: "array", maxItems: 4, items: { type: "object", additionalProperties: false, required: ["requirementId", "explanation"], properties: { requirementId: { type: "string" }, explanation: { type: "string" } } } },
      resumeEmphasis: { type: "array", maxItems: 4, items: { type: "object", additionalProperties: false, required: ["evidenceId", "recommendation"], properties: { evidenceId: { type: "string" }, recommendation: { type: "string" } } } },
      interviewTopics: { type: "array", maxItems: 4, items: { type: "object", additionalProperties: false, required: ["requirementId", "topic"], properties: { requirementId: { type: "string" }, topic: { type: "string" } } } },
      researchQuestions: { type: "array", maxItems: 4, items: { type: "string" } },
      recommendation: { type: "string", enum: ["APPLY", "REVIEW", "SKIP"] },
      rationale: { type: "string" },
    },
  };
}

function assertGrounded(jobId: string, result: ApplicationStrategy) {
  const job = getDemoJob(jobId);
  if (!job) throw new Error("Demo job was not found.");
  const requirementIds = new Set(job.requirements.map((requirement) => requirement.id));
  const evidenceIds = new Set(DEMO_CANDIDATE.evidence.map((evidence) => evidence.id));
  const requireKnown = (id: string) => { if (!requirementIds.has(id)) throw new Error("AI strategy referenced an unknown requirement."); };
  const evidenceKnown = (id: string) => { if (!evidenceIds.has(id)) throw new Error("AI strategy referenced unknown candidate evidence."); };
  result.strongestFitEvidence.forEach((item) => { requireKnown(item.requirementId); evidenceKnown(item.evidenceId); });
  result.truthfulGaps.forEach((item) => requireKnown(item.requirementId));
  result.resumeEmphasis.forEach((item) => evidenceKnown(item.evidenceId));
  result.interviewTopics.forEach((item) => requireKnown(item.requirementId));
  return result;
}

export function fixtureStrategy(jobId: string): ApplicationStrategy {
  const job = getDemoJob(jobId);
  const analysis = getDemoAnalysis(jobId);
  if (!job || !analysis) throw new Error("Demo job was not found.");
  const matched = analysis.matches[0];
  const remaining = job.requirements.filter((requirement) => requirement.id !== matched?.requirementId).slice(0, 2);
  return assertGrounded(jobId, {
    strongestFitEvidence: matched ? [{ requirementId: matched.requirementId, evidenceId: matched.evidenceId, explanation: "This synthetic candidate evidence maps directly to the named requirement." }] : [],
    truthfulGaps: remaining.map((requirement) => ({ requirementId: requirement.id, explanation: "The demo profile does not establish complete evidence for this requirement; verify it before applying." })),
    resumeEmphasis: DEMO_CANDIDATE.evidence.slice(0, 3).map((evidence) => ({ evidenceId: evidence.id, recommendation: "Use this existing synthetic evidence with a concrete outcome and scope." })),
    interviewTopics: job.requirements.slice(0, 3).map((requirement) => ({ requirementId: requirement.id, topic: `Prepare a concrete example related to ${requirement.label}.` })),
    researchQuestions: ["Which outcomes define early success in this role?", "Which systems or teams would this role partner with first?"],
    recommendation: analysis.strategyFixture.recommendation as "APPLY" | "REVIEW" | "SKIP",
    rationale: analysis.strategyFixture.rationale,
  });
}

export async function buildLiveApplicationStrategy(jobId: string, fetcher: typeof fetch = fetch) {
  const config = getDemoProviderConfig();
  if (config.mode !== "BUILD_WEEK_GPT56") throw new Error("AI analysis is temporarily unavailable. No result was generated.");
  const job = getDemoJob(jobId);
  const analysis = getDemoAnalysis(jobId);
  if (!job || !analysis) throw new Error("Demo job was not found.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetcher("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        store: false,
        max_output_tokens: 900,
        input: [
          { role: "system", content: "You create an evidence-grounded job application strategy. Return only the requested structured data. Never calculate or state a final Fit Score, hiring probability, invented experience, protected-attribute conclusion, or application submission." },
          { role: "user", content: JSON.stringify({ job, deterministicFacts: { workModes: job.workModes, travel: job.travel, requirements: job.requirements, scoreComponents: analysis.allocation }, candidateEvidence: DEMO_CANDIDATE.evidence }) },
        ],
        text: { format: { type: "json_schema", name: "jobpilot_application_strategy", strict: true, schema: schema() } },
      }),
    });
    const payload = await response.json().catch(() => ({})) as { output_text?: string; error?: { message?: string } };
    if (!response.ok || !payload.output_text) throw new Error(payload.error?.message || "AI analysis is temporarily unavailable. No result was generated.");
    return assertGrounded(jobId, strategySchema.parse(JSON.parse(payload.output_text)));
  } catch (error) {
    if (error instanceof Error && error.message.includes("unknown")) throw error;
    throw new Error("AI analysis is temporarily unavailable. No result was generated.");
  } finally { clearTimeout(timeout); }
}
