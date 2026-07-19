import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GET as healthGet } from "@/app/api/health/route";
import { POST as heavyPost } from "@/app/api/demo/heavy/route";
import { POST as strategyPost } from "@/app/api/demo/strategy/route";
import { CACHED_GEMMA_ANALYSES, DEMO_JOBS } from "@/lib/demo-contract";
import { getPublicProviderStatus } from "@/server/build-week/providers";
import { scoreJob } from "@/server/build-week/scorer";

const noKeyEnv = { BUILD_WEEK_DEMO_MODE: "true", BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES: "true", OPENAI_API_KEY: "", OPENAI_HEAVY_FEATURES_ENABLED: "false" };
const northstarId = "northstar-applied-ai-solutions-engineer";

describe("no-key judge release contract", () => {
  it("returns only the five public-safe status fields", async () => {
    const expectedKeys = ["applicationStatus", "cachedGemmaStatus", "demoDataStatus", "deterministicScorerStatus", "openAiHeavyFeatures"];
    expect(Object.keys(getPublicProviderStatus(noKeyEnv)).sort()).toEqual(expectedKeys);
    const response = await healthGet();
    expect(response.status).toBe(200);
    expect(Object.keys(await response.json()).sort()).toEqual(expectedKeys);
  });

  it("binds all six cached Gemma records to frozen inputs and deterministic receipts", () => {
    expect(CACHED_GEMMA_ANALYSES.freshInference).toBe(false);
    expect(CACHED_GEMMA_ANALYSES.analyses).toHaveLength(6);
    for (const job of DEMO_JOBS) {
      const cached = CACHED_GEMMA_ANALYSES.analyses.find((item) => item.jobId === job.id)!;
      expect(cached.jobHash).toBe(job.contentHash);
      expect(cached.modelTag).toBe("gemma4:12b");
      expect(cached.scoreReceiptHash).toBe(scoreJob(job).receipt.receiptHash);
    }
  });

  it("serves prepared strategy and critique without an OpenAI key", async () => {
    const strategy = await strategyPost(new Request("http://local/api/demo/strategy", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "release-strategy-test" }, body: JSON.stringify({ jobId: northstarId, mode: "fixture" }) }));
    expect(strategy.status).toBe(200);
    expect((await strategy.json()).provider).toMatchObject({ mode: "CODEX_GPT56_PREPARED", model: "gpt-5.6-sol", live: false });
    const challenge = await heavyPost(new Request("http://local/api/demo/heavy", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "release-challenge-test" }, body: JSON.stringify({ jobId: northstarId, action: "CHALLENGE_ANALYSIS", mode: "fixture" }) }));
    expect(challenge.status).toBe(200);
    expect((await challenge.json()).provider).toMatchObject({ mode: "CODEX_GPT56_PREPARED", model: "gpt-5.6-sol", live: false });
  });

  it("enforces heavy-route input and daily quota bounds", async () => {
    const tooLarge = await heavyPost(new Request("http://local/api/demo/heavy", { method: "POST", headers: { "content-length": "8193" }, body: "{}" }));
    expect(tooLarge.status).toBe(413);
    const responses = [];
    for (let index = 0; index < 9; index += 1) {
      responses.push(await heavyPost(new Request("http://local/api/demo/heavy", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "release-quota-test" }, body: JSON.stringify({ jobId: northstarId, action: "CHALLENGE_ANALYSIS", mode: "fixture" }) })));
    }
    expect(responses.slice(0, 8).every((response) => response.status === 200)).toBe(true);
    expect(responses[8]!.status).toBe(429);
  });

  it("keeps required hybrid trust disclosures and prepared labels in the UI", () => {
    const trust = readFileSync("src/components/demo/trust-lab.tsx", "utf8");
    for (const phrase of ["How JobPilot Saves Time", "How Roles Are Prioritized", "How the Score Is Verified", "Why Gemma Is Primary", "What GPT-5.6 Contributed", "Privacy and Limitations"]) expect(trust).toContain(phrase);
    expect(trust).toContain("OpenAI API requests: 0");
    expect(trust).toContain("never auto-applies");
    const detail = readFileSync("src/components/demo/job-detail.tsx", "utf8");
    expect(detail).toContain("Gemma 4 12B analysis pipeline");
    expect(detail).toContain("Prepared synthetic analysis");
    expect(detail).toContain("Deterministic AI Fit V2.2");
    expect(detail).toContain("See a Score Change");
    expect(detail).toContain("Prepared review");
    expect(detail).toContain("GPT-5.6 in Codex");
    expect(detail).toContain("Not a live API response");
    expect(detail).not.toContain("DetailSection letter=");
  });
});
