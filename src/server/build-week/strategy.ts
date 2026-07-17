import { z } from "zod";
import { DEMO_CANDIDATE, getDemoJob } from "@/lib/demo-contract";
import { scoreJob } from "@/server/build-week/scorer";

export const DEMO_PROVIDER_VERSION = "jobpilot-build-week-gpt56-v2.2";
export type DemoProviderMode = "PRIVATE_LOCAL" | "BUILD_WEEK_GPT56" | "FIXTURE_ONLY";

const citedEvidenceSchema = z.object({ requirementId: z.string(), evidenceId: z.string(), explanation: z.string().min(1).max(360) }).strict();
const citedRequirementSchema = z.object({ requirementId: z.string(), explanation: z.string().min(1).max(360) }).strict();
export const strategySchema = z.object({
  strongestFitEvidence: z.array(citedEvidenceSchema).max(4),
  truthfulGaps: z.array(citedRequirementSchema).max(4),
  resumeEmphasis: z.array(z.object({ evidenceId: z.string(), recommendation: z.string().min(1).max(360) }).strict()).max(4),
  interviewTopics: z.array(z.object({ requirementId: z.string(), topic: z.string().min(1).max(240) }).strict()).max(4),
  researchQuestions: z.array(z.object({ requirementId: z.string(), question: z.string().min(1).max(240) }).strict()).max(4),
  practicalConstraintsToClarify: z.array(z.object({ constraintId: z.enum(["WORK_MODE", "LOCATION", "TRAVEL"]), question: z.string().min(1).max(240) }).strict()).max(3),
  limitations: z.array(z.string().min(1).max(240)).min(1).max(4),
  recommendation: z.enum(["APPLY", "REVIEW", "SKIP"]),
  rationale: z.string().min(1).max(480),
}).strict();
export type ApplicationStrategy = z.infer<typeof strategySchema>;

const roleIntelligenceSchema = z.object({
  roleSummary: z.string().min(1).max(500),
  requiredRequirementIds: z.array(z.string()).max(20),
  preferredRequirementIds: z.array(z.string()).max(20),
  uncertaintyRequirementIds: z.array(z.string()).max(20),
}).strict();
export type RoleIntelligence = z.infer<typeof roleIntelligenceSchema>;

type DemoProviderEnvironment = Record<string, string | undefined>;

export function getDemoProviderConfig(env: DemoProviderEnvironment = process.env) {
  const requested = env.AI_PROVIDER?.trim().toUpperCase();
  const liveEnabled = env.BUILD_WEEK_DEMO_MODE === "true" && env.BUILD_WEEK_ALLOW_LIVE_GPT56 === "true" && Boolean(env.OPENAI_API_KEY?.trim());
  if (requested === "PRIVATE_LOCAL") return { mode: "PRIVATE_LOCAL" as const, model: env.OLLAMA_MODEL?.trim() || "gemma4:12b", live: false, responsesApi: false, structuredOutputs: false };
  if (liveEnabled) return { mode: "BUILD_WEEK_GPT56" as const, model: env.OPENAI_BUILD_WEEK_MODEL?.trim() || "gpt-5.6-terra", live: true, responsesApi: true, structuredOutputs: true };
  return { mode: "FIXTURE_ONLY" as const, model: "deterministic-demo-fixture", live: false, responsesApi: false, structuredOutputs: false };
}

const objectSchema = (properties: Record<string, unknown>, required: string[]) => ({ type: "object", additionalProperties: false, required, properties });
const stringArray = { type: "array", maxItems: 20, items: { type: "string" } };

function applicationStrategyJsonSchema() {
  return objectSchema({
    strongestFitEvidence: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, evidenceId: { type: "string" }, explanation: { type: "string" } }, ["requirementId", "evidenceId", "explanation"]) },
    truthfulGaps: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, explanation: { type: "string" } }, ["requirementId", "explanation"]) },
    resumeEmphasis: { type: "array", maxItems: 4, items: objectSchema({ evidenceId: { type: "string" }, recommendation: { type: "string" } }, ["evidenceId", "recommendation"]) },
    interviewTopics: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, topic: { type: "string" } }, ["requirementId", "topic"]) },
    researchQuestions: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, question: { type: "string" } }, ["requirementId", "question"]) },
    practicalConstraintsToClarify: { type: "array", maxItems: 3, items: objectSchema({ constraintId: { type: "string", enum: ["WORK_MODE", "LOCATION", "TRAVEL"] }, question: { type: "string" } }, ["constraintId", "question"]) },
    limitations: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
    recommendation: { type: "string", enum: ["APPLY", "REVIEW", "SKIP"] },
    rationale: { type: "string" },
  }, ["strongestFitEvidence", "truthfulGaps", "resumeEmphasis", "interviewTopics", "researchQuestions", "practicalConstraintsToClarify", "limitations", "recommendation", "rationale"]);
}

function roleIntelligenceJsonSchema() {
  return objectSchema({ roleSummary: { type: "string" }, requiredRequirementIds: stringArray, preferredRequirementIds: stringArray, uncertaintyRequirementIds: stringArray }, ["roleSummary", "requiredRequirementIds", "preferredRequirementIds", "uncertaintyRequirementIds"]);
}

function assertKnownIds(jobId: string, requirementIds: string[], evidenceIds: string[] = []) {
  const job = getDemoJob(jobId);
  if (!job) throw new Error("Demo job was not found.");
  const knownRequirements = new Set(job.requirements.map((requirement) => requirement.id));
  const knownEvidence = new Set(DEMO_CANDIDATE.evidence.map((evidence) => evidence.id));
  for (const id of requirementIds) if (!knownRequirements.has(id)) throw new Error("AI output referenced an unknown requirement.");
  for (const id of evidenceIds) if (!knownEvidence.has(id)) throw new Error("AI output referenced unknown candidate evidence.");
}

function assertGrounded(jobId: string, result: ApplicationStrategy) {
  assertKnownIds(jobId,
    [...result.strongestFitEvidence, ...result.truthfulGaps, ...result.interviewTopics, ...result.researchQuestions].map((item) => item.requirementId),
    [...result.strongestFitEvidence.map((item) => item.evidenceId), ...result.resumeEmphasis.map((item) => item.evidenceId)],
  );
  return result;
}

export function fixtureStrategy(jobId: string): ApplicationStrategy {
  const job = getDemoJob(jobId);
  if (!job) throw new Error("Demo job was not found.");
  const analysis = scoreJob(job);
  const supported = analysis.capabilityGroups.filter((group) => group.candidateEvidenceIds.length && group.matchClass !== "NOT_EVIDENCED" && group.matchClass !== "UNKNOWN").slice(0, 3);
  const gaps = analysis.capabilityGroups.filter((group) => group.matchClass === "NOT_EVIDENCED" || group.matchClass === "PARTIAL" || group.matchClass === "WEAK" || group.matchClass === "UNKNOWN").slice(0, 3);
  const recommendation = analysis.applyPriority === "HIGH" ? "APPLY" : analysis.applyPriority === "LOW" || analysis.applyPriority === "CONFIRMED_CONSTRAINT" ? "SKIP" : "REVIEW";
  return assertGrounded(jobId, strategySchema.parse({
    strongestFitEvidence: supported.map((group) => ({ requirementId: group.id, evidenceId: group.candidateEvidenceIds[0]!, explanation: "The cited synthetic profile evidence supports this named requirement without adding an unsupported claim." })),
    truthfulGaps: gaps.map((group) => ({ requirementId: group.id, explanation: group.matchClass === "UNKNOWN" ? "The synthetic profile does not contain enough information to classify this requirement; treat it as unknown." : "The synthetic profile does not establish full evidence for this requirement; prepare a truthful example or clarify before applying." })),
    resumeEmphasis: supported.map((group) => ({ evidenceId: group.candidateEvidenceIds[0]!, recommendation: "Emphasize this existing synthetic evidence with its documented scope, outcome, and limitation." })),
    interviewTopics: job.requirements.slice(0, 3).map((requirement) => ({ requirementId: requirement.id, topic: `Prepare a concrete, evidence-backed example for ${requirement.canonicalName}.` })),
    researchQuestions: job.requirements.slice(0, 2).map((requirement) => ({ requirementId: requirement.id, question: `How does the team evaluate ${requirement.canonicalName} during the first ninety days?` })),
    practicalConstraintsToClarify: analysis.practicalConstraints.filter((constraint) => constraint.status !== "MATCH").map((constraint) => ({ constraintId: constraint.id, question: `Clarify the ${constraint.id.toLowerCase().replaceAll("_", " ")} expectation before applying.` })),
    limitations: ["Prepared demonstration output — live GPT-5.6 is not configured in this environment.", "This strategy uses only the frozen synthetic evidence IDs and never submits an application."],
    recommendation,
    rationale: analysis.applyPriority === "CONFIRMED_CONSTRAINT" ? "A visible practical constraint conflicts with the synthetic profile, so resolve it before investing in an application." : analysis.numericScoreEligibility ? "The recommendation follows the deterministic score, evidence quality, visible gaps, and practical constraints." : "The posting is too sparse for a numeric Fit Score, so review the supported evidence and missing role detail manually.",
  }));
}

type RawResponse = { output?: { type?: string; content?: { type?: string; text?: string; refusal?: string }[] }[]; error?: { message?: string } };
export function extractResponseText(payload: RawResponse) {
  for (const output of payload.output ?? []) {
    for (const content of output.content ?? []) {
      if (content.type === "refusal") throw new Error("The model refused the structured request.");
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  throw new Error("AI analysis is temporarily unavailable. No result was generated.");
}

async function responsesRequest(name: string, schema: Record<string, unknown>, input: unknown, fetcher: typeof fetch) {
  const config = getDemoProviderConfig();
  if (config.mode !== "BUILD_WEEK_GPT56") throw new Error("AI analysis is temporarily unavailable. No result was generated.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetcher("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        store: false,
        max_output_tokens: 1_200,
        input: [
          { role: "system", content: "Return only the requested structured data. Use only supplied synthetic facts and IDs. Never calculate or state a final Fit Score, hiring probability, invented employment, years, education, certification, project, skill, protected-attribute conclusion, or application submission." },
          { role: "user", content: JSON.stringify(input) },
        ],
        text: { format: { type: "json_schema", name, strict: true, schema } },
      }),
    });
    const payload = await response.json().catch(() => ({})) as RawResponse;
    if (!response.ok) throw new Error(payload.error?.message || "AI analysis is temporarily unavailable. No result was generated.");
    return extractResponseText(payload);
  } finally {
    clearTimeout(timeout);
  }
}

export async function buildLiveApplicationStrategy(jobId: string, fetcher: typeof fetch = fetch) {
  const job = getDemoJob(jobId);
  if (!job) throw new Error("Demo job was not found.");
  const analysis = scoreJob(job);
  try {
    const text = await responsesRequest("jobpilot_application_strategy", applicationStrategyJsonSchema(), { job, deterministicFacts: { requirements: job.requirements, practicalConstraints: analysis.practicalConstraints, applyPriority: analysis.applyPriority }, candidateEvidence: DEMO_CANDIDATE.evidence }, fetcher);
    return assertGrounded(jobId, strategySchema.parse(JSON.parse(text)));
  } catch (error) {
    if (error instanceof Error && (error.message.includes("unknown requirement") || error.message.includes("unknown candidate"))) throw error;
    throw new Error("AI analysis is temporarily unavailable. No result was generated.");
  }
}

export async function buildLiveRoleIntelligence(jobId: string, fetcher: typeof fetch = fetch) {
  const job = getDemoJob(jobId);
  if (!job) throw new Error("Demo job was not found.");
  try {
    const text = await responsesRequest("jobpilot_role_intelligence", roleIntelligenceJsonSchema(), { jobId: job.id, title: job.title, sourceSections: { responsibilities: job.responsibilities, requiredQualifications: job.requiredQualifications, preferredQualifications: job.preferredQualifications }, frozenRequirements: job.requirements.map(({ id, jobEvidence, scoringClass }) => ({ id, jobEvidence, scoringClass })) }, fetcher);
    const parsed = roleIntelligenceSchema.parse(JSON.parse(text));
    assertKnownIds(jobId, [...parsed.requiredRequirementIds, ...parsed.preferredRequirementIds, ...parsed.uncertaintyRequirementIds]);
    return parsed;
  } catch (error) {
    if (error instanceof Error && error.message.includes("unknown requirement")) throw error;
    throw new Error("AI analysis is temporarily unavailable. No result was generated.");
  }
}
