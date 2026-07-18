import { DEMO_JOBS, type DemoJob } from "@/lib/demo-contract";
import { scoreJob, sha256 } from "@/server/build-week/scorer";

export type ScoreChangeScenario = ReturnType<typeof buildScoreChangeScenario>;

export function buildScoreChangeScenario() {
  const originalJob = DEMO_JOBS.find((job) => job.id === "northstar-applied-ai-solutions-engineer")!;
  const changedJob = structuredClone(originalJob) as DemoJob;
  const affected = changedJob.requirements.find((item) => item.id === "r-ns-ai")!;
  const originalClassification = affected.matchClass;
  affected.matchClass = "MATCHED";
  changedJob.contentHash = sha256({ sourceContentHash: originalJob.contentHash, scenario: "verify-r-ns-ai-as-exact", evidenceIds: affected.candidateEvidenceIds });
  const original = scoreJob(originalJob);
  const changed = scoreJob(changedJob);
  const originalGroup = original.capabilityGroups.find((item) => item.id === affected.id)!;
  const changedGroup = changed.capabilityGroups.find((item) => item.id === affected.id)!;
  const unrelatedStable = original.capabilityGroups.filter((item) => item.id !== affected.id).every((item) => changed.capabilityGroups.find((candidate) => candidate.id === item.id)?.earnedMidMicroPoints === item.earnedMidMicroPoints);
  return {
    scenarioId: "score-change-verified-ai-evidence-v1",
    disclaimer: "This scenario demonstrates score sensitivity. It does not recommend adding experience you do not have.",
    changedEvidence: "The same frozen applied-AI evidence is independently verified as an exact match; no new experience is added.",
    affectedCapability: originalGroup.canonicalName,
    requirementId: affected.id,
    evidenceIds: affected.candidateEvidenceIds,
    originalClassification,
    changedClassification: affected.matchClass,
    originalScore: original.displayedScore,
    newScore: changed.displayedScore,
    originalCapabilityPoints: originalGroup.earnedMidMicroPoints,
    newCapabilityPoints: changedGroup.earnedMidMicroPoints,
    changedPoints: changedGroup.earnedMidMicroPoints - originalGroup.earnedMidMicroPoints,
    unchangedUnrelatedPoints: unrelatedStable,
    originalReceiptHash: original.receipt.receiptHash,
    newReceiptHash: changed.receipt.receiptHash,
  };
}
