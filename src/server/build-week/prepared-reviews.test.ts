import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEMO_CANDIDATE, DEMO_JOBS } from "@/lib/demo-contract";
import { PREPARED_REVIEW_BADGE, PREPARED_REVIEW_DISCLOSURE, PREPARED_REVIEW_MANIFEST } from "@/lib/prepared-reviews";
import { sha256 } from "@/server/build-week/scorer";

const manifest = PREPARED_REVIEW_MANIFEST;

describe("zero-API GPT-5.6 prepared-review provenance", () => {
  it("binds every indexed file and structured output to its declared hash", () => {
    expect(manifest.artifacts).toHaveLength(4);
    for (const indexed of manifest.artifacts) {
      const raw = readFileSync(indexed.path);
      expect(createHash("sha256").update(raw).digest("hex")).toBe(indexed.sha256);
      const artifact = JSON.parse(raw.toString("utf8")) as Record<string, unknown>;
      expect(sha256(artifact.output)).toBe(indexed.outputHash);
      expect(artifact.outputHash).toBe(indexed.outputHash);
    }
  });

  it("records the verified Codex surface with zero API calls, cost, score generation, or stored reasoning", () => {
    expect(manifest).toMatchObject({ generationSurface: "Codex Desktop task", modelFamily: "gpt-5.6-sol", codexThreadId: "019f7382-0ef9-7d10-bf26-d6e5615924dd", apiRequestCount: 0, openAiApiCostUsd: 0, modelGeneratedFinalScores: 0, chainOfThoughtStored: false, applicationSubmissions: 0, result: "PASS" });
    expect(PREPARED_REVIEW_BADGE).toBe("GPT-5.6 — Prepared Review");
    expect(PREPARED_REVIEW_DISCLOSURE).toContain("not a live API response");
    expect(PREPARED_REVIEW_BADGE).not.toContain("Live");
  });

  it("uses only frozen job and candidate evidence IDs and reports no fabricated claims", () => {
    const requirementIds = new Set(DEMO_JOBS.flatMap((job) => job.requirements.map((item) => item.id)));
    const evidenceIds = new Set(DEMO_CANDIDATE.evidence.map((item) => item.id));
    for (const indexed of manifest.artifacts) {
      const artifact = JSON.parse(readFileSync(indexed.path, "utf8")) as { jobEvidenceIds: string[]; candidateEvidenceIds: string[]; invalidEvidenceIds: number; unsupportedCandidateClaims: number; unsupportedJobClaims: number; fabricatedExperience: number; fabricatedEducation: number; fabricatedSkills: number; apiRequestCount: number; modelGeneratedFinalScore: boolean; chainOfThoughtStored: boolean };
      expect(artifact.jobEvidenceIds.every((id) => requirementIds.has(id))).toBe(true);
      expect(artifact.candidateEvidenceIds.every((id) => evidenceIds.has(id))).toBe(true);
      expect([artifact.invalidEvidenceIds, artifact.unsupportedCandidateClaims, artifact.unsupportedJobClaims, artifact.fabricatedExperience, artifact.fabricatedEducation, artifact.fabricatedSkills, artifact.apiRequestCount]).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(artifact.modelGeneratedFinalScore).toBe(false);
      expect(artifact.chainOfThoughtStored).toBe(false);
    }
  });
});
