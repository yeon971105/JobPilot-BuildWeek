import type { Metadata } from "next";
import { DecisionUtilityStudy, type DecisionStudyRole } from "@/components/study/decision-utility-study";
import { DEMO_CANDIDATE, DEMO_JOBS, primaryLocation, workModesFor } from "@/lib/demo-contract";
import { scoreJob } from "@/server/build-week/scorer";

export const metadata: Metadata = {
  title: "Decision Utility Study | JobPilot Research",
  description: "An isolated, synthetic, local-only A/B decision-utility study harness.",
};

export default function Page() {
  const job = DEMO_JOBS[0]!;
  const analysis = scoreJob(job);
  const strongest = [...analysis.capabilityGroups].filter((group) => group.earnedMidMicroPoints > 0).sort((left, right) => right.earnedMidMicroPoints - left.earnedMidMicroPoints)[0];
  const gap = [...analysis.capabilityGroups].filter((group) => group.pointsLostMicroPoints > 0 || group.matchClass === "UNKNOWN").sort((left, right) => right.pointsLostMicroPoints - left.pointsLostMicroPoints)[0];
  const role: DecisionStudyRole = {
    id: job.id,
    company: job.company,
    title: job.title,
    summary: job.summary,
    requiredQualifications: job.requiredQualifications,
    preferredQualifications: job.preferredQualifications,
    workModes: workModesFor(job),
    location: primaryLocation(job),
    candidateEvidence: DEMO_CANDIDATE.evidence.map((item) => item.text),
    jobPilot: { fitScore: analysis.displayedScore, evidenceQuality: analysis.evidenceQuality, applyPriority: analysis.applyPriority, strongestMatch: strongest?.canonicalName ?? "Supported evidence only", biggestGap: gap?.canonicalName ?? "No confirmed point loss", blockerCount: analysis.confirmedBlockerCount },
  };
  return <DecisionUtilityStudy role={role} />;
}
