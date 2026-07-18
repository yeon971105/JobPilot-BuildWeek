import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO_CANDIDATE, DEMO_JOBS } from "@/lib/demo-contract";
import { PREPARED_REVIEW_PROOF, PREPARED_REVIEW_PROVENANCE } from "@/lib/prepared-reviews";
import proofArtifact from "../../../build-week/bw8/gpt56-prepared-proof.json";

describe("JP-BW8 prepared GPT review provenance", () => {
  it("surfaces all four prepared artifact types with verified provenance", () => {
    expect(PREPARED_REVIEW_PROOF.map((item) => item.type)).toEqual(["APPLICATION_STRATEGY", "ANALYSIS_CHALLENGE", "AMBIGUITY_REVIEW", "STRATEGY_COMPARISON"]);
    expect(PREPARED_REVIEW_PROVENANCE.verified).toBe(true);
    expect(PREPARED_REVIEW_PROVENANCE.generationSurface).toBe("Codex Desktop task");
    expect(PREPARED_REVIEW_PROVENANCE.modelFamily).toBe("gpt-5.6-sol");
    expect(PREPARED_REVIEW_PROVENANCE.apiRequestCount).toBe(0);
    expect(PREPARED_REVIEW_PROVENANCE.openAiApiCostUsd).toBe(0);
  });

  it("binds each artifact to its file, input, output, and valid evidence IDs", () => {
    const knownIds = new Set([...DEMO_JOBS.flatMap((job) => job.requirements.map((requirement) => requirement.id)), ...DEMO_CANDIDATE.evidence.map((item) => item.id)]);
    for (const artifact of PREPARED_REVIEW_PROOF) {
      expect(artifact.frozenInputHash).toMatch(/^[a-f0-9]{64}$/);
      expect(artifact.outputHash).toMatch(/^[a-f0-9]{64}$/);
      expect(createHash("sha256").update(readFileSync(resolve(artifact.path))).digest("hex")).toBe(artifact.fileSha256);
      expect(artifact.validEvidenceIds.length).toBeGreaterThan(0);
      expect(artifact.validEvidenceIds.every((id) => knownIds.has(id))).toBe(true);
      expect(artifact.invalidEvidenceIds).toBe(0);
      expect(artifact.apiRequestCount).toBe(0);
      expect(artifact.modelGeneratedFinalScore).toBe(false);
      expect(artifact.chainOfThoughtStored).toBe(false);
      expect(artifact.preparedNotLive).toBe(true);
    }
  });

  it("matches the committed public proof artifact and required zero values", () => {
    expect(proofArtifact.status).toBe("PASS");
    expect(proofArtifact.artifacts).toHaveLength(4);
    expect(proofArtifact.zeroValues.openAiApiRequests).toBe(0);
    expect(proofArtifact.zeroValues.openAiApiCostUsd).toBe(0);
    expect(proofArtifact.zeroValues.modelGeneratedFinalScores).toBe(0);
    expect(proofArtifact.zeroValues.invalidEvidenceIds).toBe(0);
    expect(proofArtifact.zeroValues.chainOfThoughtArtifacts).toBe(0);
  });
});
