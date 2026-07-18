import { z } from "zod";
import { DEMO_CANDIDATE, getDemoJob } from "@/lib/demo-contract";
import { parseRuntimeEnvironment } from "@/server/build-week/env";

export const LOCAL_GEMMA_PROMPT_VERSION = "jobpilot-local-gemma.v1";
export const LOCAL_GEMMA_SCHEMA_VERSION = "jobpilot.local-gemma-analysis.v1";

const matchSchema = z.object({
  requirementId: z.string(),
  matchedEvidenceIds: z.array(z.string()).max(4),
  matchClass: z.enum(["MATCHED", "STRONG_EQUIVALENT", "PARTIAL", "WEAK", "NOT_EVIDENCED", "UNKNOWN"]),
  uncertainty: z.string().max(240),
}).strict();

export const localGemmaAnalysisSchema = z.object({
  roleSummary: z.string().min(1).max(500),
  requiredRequirementIds: z.array(z.string()).max(20),
  preferredRequirementIds: z.array(z.string()).max(20),
  capabilityGroups: z.array(z.object({ requirementId: z.string(), canonicalName: z.string(), importance: z.enum(["CORE", "SUPPORTING", "INCIDENTAL"]), centrality: z.enum(["TITLE_OR_ROLE_MISSION", "REPEATED_ACROSS_RESPONSIBILITIES", "SINGLE_EXPLICIT_REQUIREMENT", "SUPPORTING_CONTEXT"]) }).strict()).max(20),
  evidenceMatches: z.array(matchSchema).max(20),
  limitations: z.array(z.string()).min(1).max(4),
}).strict();
export type LocalGemmaAnalysis = z.infer<typeof localGemmaAnalysisSchema>;

const objectSchema = (properties: Record<string, unknown>, required: string[]) => ({ type: "object", additionalProperties: false, properties, required });
const stringArray = { type: "array", items: { type: "string" } };
export const localGemmaJsonSchema = objectSchema({
  roleSummary: { type: "string" }, requiredRequirementIds: stringArray, preferredRequirementIds: stringArray,
  capabilityGroups: { type: "array", items: objectSchema({ requirementId: { type: "string" }, canonicalName: { type: "string" }, importance: { type: "string", enum: ["CORE", "SUPPORTING", "INCIDENTAL"] }, centrality: { type: "string", enum: ["TITLE_OR_ROLE_MISSION", "REPEATED_ACROSS_RESPONSIBILITIES", "SINGLE_EXPLICIT_REQUIREMENT", "SUPPORTING_CONTEXT"] } }, ["requirementId", "canonicalName", "importance", "centrality"]) },
  evidenceMatches: { type: "array", items: objectSchema({ requirementId: { type: "string" }, matchedEvidenceIds: stringArray, matchClass: { type: "string", enum: ["MATCHED", "STRONG_EQUIVALENT", "PARTIAL", "WEAK", "NOT_EVIDENCED", "UNKNOWN"] }, uncertainty: { type: "string" } }, ["requirementId", "matchedEvidenceIds", "matchClass", "uncertainty"]) },
  limitations: stringArray,
}, ["roleSummary", "requiredRequirementIds", "preferredRequirementIds", "capabilityGroups", "evidenceMatches", "limitations"]);

type OllamaTags = { models?: { name?: string; model?: string; digest?: string; details?: { parameter_size?: string; quantization_level?: string; family?: string } }[] };
type OllamaGenerate = { model?: string; created_at?: string; response?: string; done?: boolean; done_reason?: string; total_duration?: number; load_duration?: number; prompt_eval_count?: number; prompt_eval_duration?: number; eval_count?: number; eval_duration?: number };

export async function runLocalGemmaCanary(jobId: string, fetcher: typeof fetch = fetch, timeoutMs = 90_000) {
  const config = parseRuntimeEnvironment();
  if (!config.OLLAMA_ENABLED) throw new Error("Local Gemma validation is disabled by configuration.");
  const tagsResponse = await fetcher(`${config.OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(5_000) });
  if (!tagsResponse.ok) throw new Error("The local Ollama endpoint is unavailable.");
  const tags = await tagsResponse.json() as OllamaTags;
  const frozenModel = tags.models?.find((item) => item.name === config.OLLAMA_MODEL || item.model === config.OLLAMA_MODEL);
  if (!frozenModel) throw new Error(`Required local model ${config.OLLAMA_MODEL} is not installed. No pull was attempted.`);
  const job = getDemoJob(jobId);
  if (!job) throw new Error("Synthetic canary job was not found.");
  const allowedRequirementIds = new Set(job.requirements.map((item) => item.id));
  const allowedEvidenceIds = new Set(DEMO_CANDIDATE.evidence.map((item) => item.id));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = new Date().toISOString();
  try {
    const response = await fetcher(`${config.OLLAMA_BASE_URL}/api/generate`, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
      body: JSON.stringify({
        model: config.OLLAMA_MODEL, stream: false, think: false, format: localGemmaJsonSchema, keep_alive: "5m",
        options: { temperature: 0, num_predict: 900, seed: 17 },
        system: "Return only the requested JSON. Use only supplied synthetic requirement and evidence IDs. Do not calculate, estimate, or state a Fit Score. Do not invent work, education, years, skills, or certifications. Unknown remains UNKNOWN.",
        prompt: JSON.stringify({ schema: localGemmaJsonSchema, logicalCalls: ["JOB_SEMANTIC_ANALYSIS", "RESUME_SEMANTIC_PROFILE", "BATCHED_REQUIREMENT_MATCH"], job: { id: job.id, title: job.title, summary: job.summary, responsibilities: job.responsibilities, requiredQualifications: job.requiredQualifications, preferredQualifications: job.preferredQualifications, requirements: job.requirements.map(({ id, canonicalName, scoringClass, importance, centrality, jobEvidence }) => ({ id, canonicalName, scoringClass, importance, centrality, jobEvidence })) }, candidateSemanticProfile: { id: DEMO_CANDIDATE.id, evidence: DEMO_CANDIDATE.evidence } }),
      }),
    });
    if (!response.ok) throw new Error(`Local Gemma returned HTTP ${response.status}.`);
    const payload = await response.json() as OllamaGenerate;
    if (!payload.done || !payload.response) throw new Error("Local Gemma returned an incomplete structured result.");
    const analysis = localGemmaAnalysisSchema.parse(JSON.parse(payload.response));
    for (const id of [...analysis.requiredRequirementIds, ...analysis.preferredRequirementIds, ...analysis.capabilityGroups.map((item) => item.requirementId), ...analysis.evidenceMatches.map((item) => item.requirementId)]) if (!allowedRequirementIds.has(id)) throw new Error("Local Gemma referenced an unknown requirement ID.");
    for (const id of analysis.evidenceMatches.flatMap((item) => item.matchedEvidenceIds)) if (!allowedEvidenceIds.has(id)) throw new Error("Local Gemma referenced an unknown evidence ID.");
    return { analysis, metadata: { model: config.OLLAMA_MODEL, digest: frozenModel.digest ?? null, parameterSize: frozenModel.details?.parameter_size ?? null, quantization: frozenModel.details?.quantization_level ?? null, family: frozenModel.details?.family ?? null, endpoint: config.OLLAMA_BASE_URL, remoteEndpointUsed: false, promptVersion: LOCAL_GEMMA_PROMPT_VERSION, schemaVersion: LOCAL_GEMMA_SCHEMA_VERSION, startedAt, completedAt: new Date().toISOString(), doneReason: payload.done_reason ?? null, totalDurationNs: payload.total_duration ?? null, loadDurationNs: payload.load_duration ?? null, promptTokens: payload.prompt_eval_count ?? null, outputTokens: payload.eval_count ?? null, thinkingStored: false, modelPulled: false, modelSubstituted: false } };
  } finally { clearTimeout(timeout); }
}
