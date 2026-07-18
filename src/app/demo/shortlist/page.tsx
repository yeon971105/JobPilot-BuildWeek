import type { Metadata } from "next";
import { TodayShortlist } from "@/components/demo/shortlist";
import { DEMO_JOBS } from "@/lib/demo-contract";
import type { ShortlistAnalysis } from "@/lib/shortlist";
import { scoreJob } from "@/server/build-week/scorer";

export const metadata: Metadata = {
  title: "Today's 3 Roles Worth Your Time | JobPilot",
  description: "A transparent three-role shortlist ordered only by visible deterministic factors.",
};

export default function Page() {
  const analyses: ShortlistAnalysis[] = DEMO_JOBS.map((job) => {
    const analysis = scoreJob(job);
    const strongest = [...analysis.capabilityGroups].filter((group) => group.earnedMidMicroPoints > 0).sort((left, right) => right.earnedMidMicroPoints - left.earnedMidMicroPoints)[0];
    const gap = [...analysis.capabilityGroups].filter((group) => group.pointsLostMicroPoints > 0 || group.matchClass === "UNKNOWN").sort((left, right) => right.pointsLostMicroPoints - left.pointsLostMicroPoints)[0];
    return {
      jobId: job.id,
      score: analysis.displayedScore,
      evidenceQuality: analysis.evidenceQuality,
      evidenceSufficient: analysis.numericScoreEligibility,
      confirmedBlockerCount: analysis.confirmedBlockerCount,
      priority: analysis.applyPriority,
      strongestCapability: strongest?.canonicalName ?? "Supported evidence only",
      largestGap: gap?.canonicalName ?? "No confirmed point loss",
    };
  });
  return <TodayShortlist jobs={DEMO_JOBS} analyses={analyses} />;
}
