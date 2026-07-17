import { describe, expect, it } from "vitest";
import { DEMO_CANDIDATE, DEMO_JOBS } from "@/lib/demo-contract";
import { extractResponseText, fixtureStrategy, getDemoProviderConfig } from "@/server/build-week/strategy";

describe("Build Week provider contract", () => {
  it("keeps fixture strategies grounded in frozen internal IDs", () => {
    for (const job of DEMO_JOBS) {
      const strategy = fixtureStrategy(job.id);
      const requirementIds = new Set(job.requirements.map((item) => item.id));
      const evidenceIds = new Set(DEMO_CANDIDATE.evidence.map((item) => item.id));
      strategy.strongestFitEvidence.forEach((item) => { expect(requirementIds.has(item.requirementId)).toBe(true); expect(evidenceIds.has(item.evidenceId)).toBe(true); });
      strategy.truthfulGaps.forEach((item) => expect(requirementIds.has(item.requirementId)).toBe(true));
      strategy.resumeEmphasis.forEach((item) => expect(evidenceIds.has(item.evidenceId)).toBe(true));
      expect(strategy.limitations.join(" ")).toContain("live GPT-5.6 is not configured");
    }
  });

  it("never silently represents a fixture as live GPT-5.6", () => {
    expect(getDemoProviderConfig({ BUILD_WEEK_DEMO_MODE: "true" })).toMatchObject({ mode: "FIXTURE_ONLY", live: false });
    expect(getDemoProviderConfig({ AI_PROVIDER: "PRIVATE_LOCAL", OLLAMA_MODEL: "gemma4:12b" })).toMatchObject({ mode: "PRIVATE_LOCAL", model: "gemma4:12b", live: false });
    expect(getDemoProviderConfig({ BUILD_WEEK_DEMO_MODE: "true", BUILD_WEEK_ALLOW_LIVE_GPT56: "true", OPENAI_API_KEY: "test-only" })).toMatchObject({ mode: "BUILD_WEEK_GPT56", model: "gpt-5.6-terra", live: true, responsesApi: true, structuredOutputs: true });
  });

  it("extracts raw Responses API output content instead of relying on an SDK convenience field", () => {
    expect(extractResponseText({ output: [{ type: "message", content: [{ type: "output_text", text: "{\"ok\":true}" }] }] })).toBe("{\"ok\":true}");
    expect(() => extractResponseText({ output: [{ content: [{ type: "refusal", refusal: "no" }] }] })).toThrow("refused");
    expect(() => extractResponseText({ output: [] })).toThrow("No result was generated");
  });
});
