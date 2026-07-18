import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_WORK_PREFERENCES } from "@/lib/private-profile";
import { DEMO_JOBS } from "@/lib/demo-contract";
import { analyzePrivateProfile } from "@/server/private-profile/local-analysis";
import { parseStructuredProfile } from "@/server/private-profile/resume-parser";

function confirmedProfile() {
  return {
    ...parseStructuredProfile([
      "Experience",
      "Platform Engineer | Synthetic Systems",
      "January 2021 - December 2025",
      "Built TypeScript data services with PostgreSQL and Kubernetes.",
      "Skills",
      "TypeScript, PostgreSQL, Kubernetes",
    ].join("\n"), "TXT", "c".repeat(64), "2026-07-18T00:00:00.000Z"),
    confirmedAt: "2026-07-18T00:01:00.000Z",
  };
}

afterEach(() => vi.unstubAllEnvs());

describe("private local Gemma boundary", () => {
  it("sends only confirmed structured evidence to a loopback Ollama endpoint and leaves scoring deterministic", async () => {
    vi.stubEnv("LOCAL_PRIVATE_MODE", "true");
    vi.stubEnv("OLLAMA_ENABLED", "true");
    vi.stubEnv("OLLAMA_BASE_URL", "http://127.0.0.1:11434");
    vi.stubEnv("OLLAMA_MODEL", "gemma4:12b");
    const job = DEMO_JOBS[0]!;
    const profile = confirmedProfile();
    const requirement = job.requirements[0]!;
    const evidence = profile.evidence[0]!;
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      done: true,
      response: JSON.stringify({
        profileSummary: "A synthetic platform profile with explicit engineering evidence.",
        matches: [{ requirementId: requirement.id, evidenceIds: [evidence.id], matchClass: "MATCHED", explanation: "The confirmed evidence directly supports this requirement." }],
        limitations: ["Only confirmed resume evidence was considered."],
      }),
    }), { status: 200, headers: { "content-type": "application/json" } })) as unknown as typeof fetch;

    const result = await analyzePrivateProfile(job.id, profile, DEFAULT_WORK_PREFERENCES, fetcher);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init] = (fetcher as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(url).toBe("http://127.0.0.1:11434/api/generate");
    const body = JSON.parse(String((init as RequestInit).body));
    expect(body.model).toBe("gemma4:12b");
    expect(body.prompt).toContain("confirmedProfile");
    expect(body.prompt).not.toContain("rawResume");
    expect(body.system).toMatch(/untrusted data|Do not infer protected attributes/);
    expect(result.provider).toEqual({ analysisPipeline: "Gemma 4 12B — Live Local", deliveryMode: "Private local analysis", scoringEngine: "Deterministic AI Fit V2.2" });
    expect(result.analysis.receipt).toMatchObject({ provider: "LOCAL_GEMMA_LIVE", modelTag: "gemma4:12b" });
    expect(JSON.stringify(result.analysis.receipt)).not.toContain("Built TypeScript data services");
    expect(result.analysis.capabilityGroups.find((item) => item.capabilityGroupId === requirement.capabilityGroupId)?.matchClass).toBe("MATCHED");
  });

  it("rejects hallucinated requirement or evidence identifiers", async () => {
    vi.stubEnv("LOCAL_PRIVATE_MODE", "true");
    vi.stubEnv("OLLAMA_ENABLED", "true");
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      done: true,
      response: JSON.stringify({ profileSummary: "Synthetic summary", matches: [{ requirementId: "unknown-requirement", evidenceIds: ["unknown-evidence"], matchClass: "MATCHED", explanation: "Unsupported identifiers." }], limitations: [] }),
    }), { status: 200 })) as unknown as typeof fetch;
    await expect(analyzePrivateProfile(DEMO_JOBS[0]!.id, confirmedProfile(), DEFAULT_WORK_PREFERENCES, fetcher)).rejects.toThrow(/unknown requirement/);
  });

  it("fails closed before network access when private mode is disabled", async () => {
    vi.stubEnv("LOCAL_PRIVATE_MODE", "false");
    const fetcher = vi.fn() as unknown as typeof fetch;
    await expect(analyzePrivateProfile(DEMO_JOBS[0]!.id, confirmedProfile(), DEFAULT_WORK_PREFERENCES, fetcher)).rejects.toThrow(/disabled/);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
