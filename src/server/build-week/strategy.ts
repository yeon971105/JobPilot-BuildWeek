import { z } from "zod";
import { DEMO_CANDIDATE, getDemoJob } from "@/lib/demo-contract";
import { getOpenAiApiKey, parseRuntimeEnvironment } from "@/server/build-week/env";
import { routeHybridTask, type DemoProviderMode } from "@/server/build-week/providers";
import { scoreJob } from "@/server/build-week/scorer";

export { getDemoProviderConfig } from "@/server/build-week/providers";
export type { DemoProviderMode } from "@/server/build-week/providers";
export const HEAVY_PROVIDER_VERSION = "jobpilot-openai-heavy.v1";

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

export const challengeSchema = z.object({
  supportedFindings: z.array(z.object({ requirementId: z.string(), evidenceIds: z.array(z.string()).max(4), assessment: z.string().max(320) }).strict()).max(4),
  questionableMatches: z.array(z.object({ requirementId: z.string(), evidenceIds: z.array(z.string()).max(4), assessment: z.string().max(320) }).strict()).max(4),
  missingConsiderations: z.array(z.object({ requirementId: z.string(), consideration: z.string().max(320) }).strict()).max(4),
  classificationDisagreements: z.array(z.object({ requirementId: z.string(), evidenceIds: z.array(z.string()).max(4), currentMatchClass: z.string(), suggestedMatchClass: z.string(), rationale: z.string().max(360) }).strict()).max(4),
  uncertainty: z.array(z.string().max(240)).max(4),
  limitations: z.array(z.string().max(240)).min(1).max(4),
}).strict();
export type AnalysisChallenge = z.infer<typeof challengeSchema>;

export const ambiguitySchema = z.object({ requirementId: z.string(), interpretation: z.string().max(360), alternativeInterpretations: z.array(z.string().max(240)).max(3), relevantEvidenceIds: z.array(z.string()).max(4), uncertainty: z.string().max(240), limitations: z.array(z.string().max(240)).min(1).max(3) }).strict();
export const comparisonSchema = z.object({ preferredStrategy: z.enum(["A", "B", "NEITHER"]), rationale: z.string().max(420), supportedDifferences: z.array(z.object({ requirementId: z.string(), evidenceIds: z.array(z.string()).max(4), difference: z.string().max(320) }).strict()).max(5), risks: z.array(z.string().max(240)).max(4), limitations: z.array(z.string().max(240)).min(1).max(3) }).strict();

export type HeavyAction = "APPLICATION_STRATEGY" | "CHALLENGE_ANALYSIS" | "RESOLVE_AMBIGUITY" | "COMPARE_STRATEGIES";
const objectSchema = (properties: Record<string, unknown>, required: string[]) => ({ type: "object", additionalProperties: false, required, properties });
const stringArray = { type: "array", items: { type: "string" } };
const citedEvidenceJson = objectSchema({ requirementId: { type: "string" }, evidenceId: { type: "string" }, explanation: { type: "string" } }, ["requirementId", "evidenceId", "explanation"]);

const applicationStrategyJsonSchema = objectSchema({
  strongestFitEvidence: { type: "array", maxItems: 4, items: citedEvidenceJson },
  truthfulGaps: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, explanation: { type: "string" } }, ["requirementId", "explanation"]) },
  resumeEmphasis: { type: "array", maxItems: 4, items: objectSchema({ evidenceId: { type: "string" }, recommendation: { type: "string" } }, ["evidenceId", "recommendation"]) },
  interviewTopics: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, topic: { type: "string" } }, ["requirementId", "topic"]) },
  researchQuestions: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, question: { type: "string" } }, ["requirementId", "question"]) },
  practicalConstraintsToClarify: { type: "array", maxItems: 3, items: objectSchema({ constraintId: { type: "string", enum: ["WORK_MODE", "LOCATION", "TRAVEL"] }, question: { type: "string" } }, ["constraintId", "question"]) },
  limitations: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } }, recommendation: { type: "string", enum: ["APPLY", "REVIEW", "SKIP"] }, rationale: { type: "string" },
}, ["strongestFitEvidence", "truthfulGaps", "resumeEmphasis", "interviewTopics", "researchQuestions", "practicalConstraintsToClarify", "limitations", "recommendation", "rationale"]);

const challengeJsonSchema = objectSchema({
  supportedFindings: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, evidenceIds: stringArray, assessment: { type: "string" } }, ["requirementId", "evidenceIds", "assessment"]) },
  questionableMatches: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, evidenceIds: stringArray, assessment: { type: "string" } }, ["requirementId", "evidenceIds", "assessment"]) },
  missingConsiderations: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, consideration: { type: "string" } }, ["requirementId", "consideration"]) },
  classificationDisagreements: { type: "array", maxItems: 4, items: objectSchema({ requirementId: { type: "string" }, evidenceIds: stringArray, currentMatchClass: { type: "string" }, suggestedMatchClass: { type: "string" }, rationale: { type: "string" } }, ["requirementId", "evidenceIds", "currentMatchClass", "suggestedMatchClass", "rationale"]) },
  uncertainty: stringArray, limitations: { type: "array", minItems: 1, items: { type: "string" } },
}, ["supportedFindings", "questionableMatches", "missingConsiderations", "classificationDisagreements", "uncertainty", "limitations"]);

const ambiguityJsonSchema = objectSchema({ requirementId: { type: "string" }, interpretation: { type: "string" }, alternativeInterpretations: stringArray, relevantEvidenceIds: stringArray, uncertainty: { type: "string" }, limitations: { type: "array", minItems: 1, items: { type: "string" } } }, ["requirementId", "interpretation", "alternativeInterpretations", "relevantEvidenceIds", "uncertainty", "limitations"]);
const comparisonJsonSchema = objectSchema({ preferredStrategy: { type: "string", enum: ["A", "B", "NEITHER"] }, rationale: { type: "string" }, supportedDifferences: { type: "array", items: objectSchema({ requirementId: { type: "string" }, evidenceIds: stringArray, difference: { type: "string" } }, ["requirementId", "evidenceIds", "difference"]) }, risks: stringArray, limitations: { type: "array", minItems: 1, items: { type: "string" } } }, ["preferredStrategy", "rationale", "supportedDifferences", "risks", "limitations"]);

function assertKnownIds(jobId: string, requirementIds: string[], evidenceIds: string[] = []) {
  const job = getDemoJob(jobId);
  if (!job) throw new Error("Demo job was not found.");
  const requirements = new Set(job.requirements.map((item) => item.id));
  const evidence = new Set(DEMO_CANDIDATE.evidence.map((item) => item.id));
  for (const id of requirementIds) if (!requirements.has(id)) throw new Error("AI output referenced an unknown requirement ID.");
  for (const id of evidenceIds) if (!evidence.has(id)) throw new Error("AI output referenced an unknown evidence ID.");
}

function assertStrategyGrounded(jobId: string, result: ApplicationStrategy) {
  assertKnownIds(jobId, [...result.strongestFitEvidence, ...result.truthfulGaps, ...result.interviewTopics, ...result.researchQuestions].map((item) => item.requirementId), [...result.strongestFitEvidence.map((item) => item.evidenceId), ...result.resumeEmphasis.map((item) => item.evidenceId)]);
  return result;
}

export function fixtureStrategy(jobId: string): ApplicationStrategy {
  const job = getDemoJob(jobId);
  if (!job) throw new Error("Demo job was not found.");
  const analysis = scoreJob(job);
  const supported = analysis.capabilityGroups.filter((group) => group.candidateEvidenceIds.length && !["NOT_EVIDENCED", "UNKNOWN"].includes(group.matchClass)).slice(0, 3);
  const gaps = analysis.capabilityGroups.filter((group) => ["NOT_EVIDENCED", "PARTIAL", "WEAK", "UNKNOWN"].includes(group.matchClass)).slice(0, 3);
  const recommendation = analysis.applyPriority === "HIGH" ? "APPLY" : ["LOW", "CONFIRMED_CONSTRAINT"].includes(analysis.applyPriority) ? "SKIP" : "REVIEW";
  return assertStrategyGrounded(jobId, strategySchema.parse({
    strongestFitEvidence: supported.map((group) => ({ requirementId: group.id, evidenceId: group.candidateEvidenceIds[0]!, explanation: "The cited synthetic evidence supports this requirement without adding an unsupported claim." })),
    truthfulGaps: gaps.map((group) => ({ requirementId: group.id, explanation: group.matchClass === "UNKNOWN" ? "Available synthetic evidence is insufficient; this remains unknown." : "The synthetic profile does not establish full evidence; clarify or prepare an existing truthful example." })),
    resumeEmphasis: supported.map((group) => ({ evidenceId: group.candidateEvidenceIds[0]!, recommendation: "Emphasize this existing evidence with its documented scope, outcome, and limitations." })),
    interviewTopics: job.requirements.slice(0, 3).map((requirement) => ({ requirementId: requirement.id, topic: `Prepare an evidence-backed example for ${requirement.canonicalName}.` })),
    researchQuestions: job.requirements.slice(0, 2).map((requirement) => ({ requirementId: requirement.id, question: `How does the team evaluate ${requirement.canonicalName} during the first ninety days?` })),
    practicalConstraintsToClarify: analysis.practicalConstraints.filter((item) => item.status !== "MATCH").map((item) => ({ constraintId: item.id, question: `Clarify the ${item.id.toLowerCase().replaceAll("_", " ")} expectation before applying.` })),
    limitations: ["Prepared demonstration output — live GPT-5.6 heavy reasoning is not enabled in this environment.", "Only frozen synthetic evidence IDs are used; no application is submitted."], recommendation,
    rationale: analysis.applyPriority === "CONFIRMED_CONSTRAINT" ? "Resolve the visible practical constraint before investing in an application." : analysis.numericScoreEligibility ? "The recommendation follows the deterministic receipt, evidence, gaps, and practical constraints." : "The posting is too sparse for a numeric Fit Score; review it manually.",
  }));
}

export function fixtureChallenge(jobId: string): AnalysisChallenge {
  const job = getDemoJob(jobId); if (!job) throw new Error("Demo job was not found.");
  const analysis = scoreJob(job); const supported = analysis.capabilityGroups.filter((item) => item.matchClass === "MATCHED").slice(0, 2); const questionable = analysis.capabilityGroups.filter((item) => ["STRONG_EQUIVALENT", "PARTIAL", "WEAK", "UNKNOWN"].includes(item.matchClass)).slice(0, 2);
  return challengeSchema.parse({ supportedFindings: supported.map((item) => ({ requirementId: item.id, evidenceIds: item.candidateEvidenceIds, assessment: "The frozen evidence and deterministic classification are internally consistent." })), questionableMatches: questionable.map((item) => ({ requirementId: item.id, evidenceIds: item.candidateEvidenceIds, assessment: "This semantic classification should remain reviewable because it contributes to the score range." })), missingConsiderations: [], classificationDisagreements: [], uncertainty: questionable.map((item) => `${item.id} remains subject to semantic review.`), limitations: ["Prepared demonstration critique — no live GPT-5.6 request was made.", "Review feedback never mutates the deterministic score."] });
}

type RawResponse = { output?: { type?: string; content?: { type?: string; text?: string; refusal?: string }[] }[]; error?: { message?: string }; status?: string; incomplete_details?: { reason?: string } };
export function extractResponseText(payload: RawResponse) {
  if (payload.status === "incomplete") throw new Error(`The model returned incomplete output${payload.incomplete_details?.reason ? `: ${payload.incomplete_details.reason}` : "."}`);
  for (const output of payload.output ?? []) for (const content of output.content ?? []) {
    if (content.type === "refusal") throw new Error("The model refused the structured request.");
    if (content.type === "output_text" && content.text) return content.text;
  }
  throw new Error("AI analysis is temporarily unavailable. No result was generated.");
}

async function responsesRequest(name: string, schema: Record<string, unknown>, input: unknown, fetcher: typeof fetch) {
  const config = parseRuntimeEnvironment();
  const route = routeHybridTask("APPLICATION_STRATEGY", config);
  const key = getOpenAiApiKey();
  if (route.provider !== "OPENAI_GPT56_HEAVY" || !key) throw new Error("OpenAI heavy reasoning is not enabled.");
  const serialized = JSON.stringify(input);
  if (serialized.length > 48_000) throw new Error("The bounded heavy-reasoning input is too large.");
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetcher("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ model: config.OPENAI_HEAVY_MODEL, store: false, max_output_tokens: 1_500, input: [{ role: "system", content: "Return only the requested structured data. Use only supplied synthetic facts and IDs. Never calculate or replace a Fit Score, reveal chain-of-thought, invent candidate history, or submit an application." }, { role: "user", content: serialized }], text: { format: { type: "json_schema", name, strict: true, schema } } }) });
    const payload = await response.json().catch(() => ({})) as RawResponse;
    if (!response.ok) throw new Error(payload.error?.message || "AI analysis is temporarily unavailable. No result was generated.");
    return extractResponseText(payload);
  } finally { clearTimeout(timeout); }
}

function compactHeavyInput(jobId: string) {
  const job = getDemoJob(jobId); if (!job) throw new Error("Demo job was not found."); const analysis = scoreJob(job);
  return { job: { id: job.id, title: job.title, requirements: analysis.capabilityGroups.map(({ id, canonicalName, scoringClass, jobEvidence, matchClass, candidateEvidenceIds }) => ({ id, canonicalName, scoringClass, jobEvidence, matchClass, candidateEvidenceIds })) }, candidateEvidence: DEMO_CANDIDATE.evidence.map(({ id, label, text }) => ({ id, label, text })), deterministicReceipt: { receiptHash: analysis.receipt.receiptHash, scorerVersion: analysis.receipt.scorerVersion, numericScoreEligibility: analysis.numericScoreEligibility, displayedScore: analysis.displayedScore, classTotals: analysis.classTotals, hiddenAdjustments: 0 }, practicalConstraints: analysis.practicalConstraints };
}

export async function buildLiveApplicationStrategy(jobId: string, fetcher: typeof fetch = fetch) {
  const text = await responsesRequest("jobpilot_application_strategy", applicationStrategyJsonSchema, compactHeavyInput(jobId), fetcher);
  return assertStrategyGrounded(jobId, strategySchema.parse(JSON.parse(text)));
}

export async function challengeLiveAnalysis(jobId: string, fetcher: typeof fetch = fetch) {
  const text = await responsesRequest("jobpilot_analysis_challenge", challengeJsonSchema, compactHeavyInput(jobId), fetcher); const result = challengeSchema.parse(JSON.parse(text));
  assertKnownIds(jobId, [...result.supportedFindings, ...result.questionableMatches, ...result.missingConsiderations, ...result.classificationDisagreements].map((item) => item.requirementId), [...result.supportedFindings, ...result.questionableMatches, ...result.classificationDisagreements].flatMap((item) => item.evidenceIds)); return result;
}

export async function resolveLiveAmbiguity(jobId: string, requirementId: string, fetcher: typeof fetch = fetch) {
  assertKnownIds(jobId, [requirementId]); const text = await responsesRequest("jobpilot_resolve_ambiguity", ambiguityJsonSchema, { ...compactHeavyInput(jobId), requestedRequirementId: requirementId }, fetcher); const result = ambiguitySchema.parse(JSON.parse(text)); assertKnownIds(jobId, [result.requirementId], result.relevantEvidenceIds); return result;
}

export async function compareLiveStrategies(jobId: string, strategyA: ApplicationStrategy, strategyB: ApplicationStrategy, fetcher: typeof fetch = fetch) {
  assertStrategyGrounded(jobId, strategyA); assertStrategyGrounded(jobId, strategyB); const text = await responsesRequest("jobpilot_compare_strategies", comparisonJsonSchema, { ...compactHeavyInput(jobId), strategyA, strategyB }, fetcher); const result = comparisonSchema.parse(JSON.parse(text)); assertKnownIds(jobId, result.supportedDifferences.map((item) => item.requirementId), result.supportedDifferences.flatMap((item) => item.evidenceIds)); return result;
}

export function providerBadge(mode: DemoProviderMode) {
  return ({ LOCAL_GEMMA_LIVE: "Local Gemma — Live", LOCAL_GEMMA_PREPARED: "Local Gemma — Prepared Analysis", OPENAI_GPT56_HEAVY: "GPT-5.6 — Live Heavy Reasoning", CODEX_GPT56_PREPARED: "GPT-5.6 — Prepared Review", FIXTURE_ONLY: "Codex — Prepared Review" } as const)[mode];
}
