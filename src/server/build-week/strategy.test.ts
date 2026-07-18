import { afterEach, describe, expect, it, vi } from "vitest";
import { DEMO_CANDIDATE, DEMO_JOBS } from "@/lib/demo-contract";
import { parseRuntimeEnvironment } from "@/server/build-week/env";
import { getDemoProviderConfig, routeHybridTask } from "@/server/build-week/providers";
import { localGemmaAnalysisSchema, runLocalGemmaCanary } from "@/server/build-week/local-gemma";
import { buildLiveApplicationStrategy, challengeLiveAnalysis, extractResponseText, fixtureChallenge, fixtureStrategy } from "@/server/build-week/strategy";

afterEach(() => vi.unstubAllEnvs());

const baseEnv = { AI_RUNTIME_MODE: "LOCAL_FIRST", OLLAMA_BASE_URL: "http://127.0.0.1:11434", OLLAMA_MODEL: "gemma4:12b", OLLAMA_ENABLED: "true", OPENAI_HEAVY_FEATURES_ENABLED: "false", OPENAI_HEAVY_MODEL: "gpt-5.6-terra", BUILD_WEEK_DEMO_MODE: "true", BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES: "true", BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS: "false", BUILD_WEEK_ALLOW_LIVE_GPT56: "false", OPENAI_API_KEY: "" };

describe("local-first hybrid provider contract", () => {
  it("routes semantic work to prepared Gemma and heavy work to prepared Codex output without a key", () => {
    const config = parseRuntimeEnvironment(baseEnv);
    expect(routeHybridTask("JOB_SEMANTIC_ANALYSIS", config)).toMatchObject({ provider: "LOCAL_GEMMA_PREPARED", live: false, model: "gemma4:12b" });
    expect(routeHybridTask("APPLICATION_STRATEGY", config)).toMatchObject({ provider: "CODEX_GPT56_PREPARED", model: "gpt-5.6-sol", live: false });
  });

  it("does not enable OpenAI when a key exists but the heavy flag is false", () => {
    expect(getDemoProviderConfig({ ...baseEnv, OPENAI_API_KEY: "test-only-not-real" })).toMatchObject({ mode: "CODEX_GPT56_PREPARED", model: "gpt-5.6-sol", live: false });
  });

  it("enables heavy reasoning with a key and one feature flag", () => {
    expect(getDemoProviderConfig({ ...baseEnv, OPENAI_API_KEY: "test-only-not-real", OPENAI_HEAVY_FEATURES_ENABLED: "true" })).toMatchObject({ mode: "OPENAI_GPT56_HEAVY", model: "gpt-5.6-terra", live: true, responsesApi: true, structuredOutputs: true });
  });

  it("rejects a non-loopback Ollama endpoint and model substitution", () => {
    expect(() => parseRuntimeEnvironment({ ...baseEnv, OLLAMA_BASE_URL: "https://example.com" })).toThrow("loopback");
    expect(() => parseRuntimeEnvironment({ ...baseEnv, OLLAMA_MODEL: "gemma3:12b" })).toThrow();
  });
});

describe("prepared outputs", () => {
  it("keeps strategies and critiques grounded in frozen IDs", () => {
    for (const job of DEMO_JOBS) {
      const requirementIds = new Set(job.requirements.map((item) => item.id));
      const evidenceIds = new Set(DEMO_CANDIDATE.evidence.map((item) => item.id));
      const strategy = fixtureStrategy(job.id);
      strategy.strongestFitEvidence.forEach((item) => { expect(requirementIds.has(item.requirementId)).toBe(true); expect(evidenceIds.has(item.evidenceId)).toBe(true); });
      strategy.truthfulGaps.forEach((item) => expect(requirementIds.has(item.requirementId)).toBe(true));
      expect(strategy.limitations.join(" ")).toContain("Prepared demonstration output");
      const challenge = fixtureChallenge(job.id);
      challenge.supportedFindings.forEach((item) => expect(requirementIds.has(item.requirementId)).toBe(true));
      expect(challenge.limitations.join(" ")).toContain("Prepared demonstration critique");
    }
  });
});

describe("bounded OpenAI heavy transport", () => {
  it("handles raw response text, refusals, and incomplete output", () => {
    expect(extractResponseText({ output: [{ type: "message", content: [{ type: "output_text", text: "{\"ok\":true}" }] }] })).toBe("{\"ok\":true}");
    expect(() => extractResponseText({ output: [{ content: [{ type: "refusal", refusal: "no" }] }] })).toThrow("refused");
    expect(() => extractResponseText({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" } })).toThrow("incomplete");
  });

  it("validates a mocked application strategy without a live key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-not-real"); vi.stubEnv("OPENAI_HEAVY_FEATURES_ENABLED", "true"); vi.stubEnv("OPENAI_HEAVY_MODEL", "gpt-5.6-terra");
    const prepared = fixtureStrategy(DEMO_JOBS[0]!.id);
    let requestBody: Record<string, unknown> | null = null;
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => { requestBody = JSON.parse(String(init?.body)); return new Response(JSON.stringify({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(prepared) }] }] }), { status: 200 }); }) as unknown as typeof fetch;
    const result = await buildLiveApplicationStrategy(DEMO_JOBS[0]!.id, fetcher);
    expect(result.recommendation).toBe(prepared.recommendation);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(requestBody).toMatchObject({ model: "gpt-5.6-terra", store: false, max_output_tokens: 1500 });
    expect(JSON.stringify(requestBody)).not.toContain("OPENAI_API_KEY");
  });

  it("validates a mocked independent challenge without mutating the score", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-only-not-real"); vi.stubEnv("OPENAI_HEAVY_FEATURES_ENABLED", "true");
    const prepared = fixtureChallenge(DEMO_JOBS[0]!.id);
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ status: "completed", output: [{ content: [{ type: "output_text", text: JSON.stringify(prepared) }] }] }), { status: 200 })) as unknown as typeof fetch;
    const result = await challengeLiveAnalysis(DEMO_JOBS[0]!.id, fetcher);
    expect(result.limitations).toHaveLength(prepared.limitations.length);
  });
});

describe("local Gemma adapter", () => {
  it("uses one structured batched local call and validates all IDs", async () => {
    const job = DEMO_JOBS[0]!;
    const result = localGemmaAnalysisSchema.parse({ roleSummary: job.summary, requiredRequirementIds: job.requirements.filter((item) => item.scoringClass === "CORE").map((item) => item.id), preferredRequirementIds: job.requirements.filter((item) => item.scoringClass === "PREFERRED").map((item) => item.id), capabilityGroups: job.requirements.map((item) => ({ requirementId: item.id, canonicalName: item.canonicalName, importance: item.importance, centrality: item.centrality })), evidenceMatches: job.requirements.map((item) => ({ requirementId: item.id, matchedEvidenceIds: item.candidateEvidenceIds, matchClass: item.matchClass === "EXPLICIT_CONFLICT" || item.matchClass === "NOT_APPLICABLE" ? "UNKNOWN" : item.matchClass, uncertainty: "Frozen synthetic canary." })), limitations: ["Synthetic canary only."] });
    const fetcher = vi.fn(async (input: string | URL | Request) => String(input).endsWith("/api/tags") ? new Response(JSON.stringify({ models: [{ name: "gemma4:12b", digest: "4eb23e", details: { parameter_size: "11.9B", quantization_level: "Q4_K_M", family: "gemma4" } }] }), { status: 200 }) : new Response(JSON.stringify({ model: "gemma4:12b", response: JSON.stringify(result), done: true, done_reason: "stop", total_duration: 10, prompt_eval_count: 100, eval_count: 200 }), { status: 200 })) as unknown as typeof fetch;
    const canary = await runLocalGemmaCanary(job.id, fetcher, 5_000);
    expect(canary.analysis.evidenceMatches).toHaveLength(job.requirements.length);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(canary.metadata.thinkingStored).toBe(false);
  });
});
