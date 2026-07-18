import { ComparisonPage, type ComparisonAnalysis } from "@/components/demo/comparison";
import { DEMO_JOBS } from "@/lib/demo-contract";
import { scoreJob } from "@/server/build-week/scorer";

export default function Page() {
  const analyses: ComparisonAnalysis[] = DEMO_JOBS.map((job) => {
    const analysis = scoreJob(job);
    const topMatches = [...analysis.capabilityGroups].filter((group) => group.earnedMidMicroPoints > 0).sort((a, b) => b.earnedMidMicroPoints - a.earnedMidMicroPoints).slice(0, 3).map((group) => group.canonicalName);
    const topGaps = [...analysis.capabilityGroups].filter((group) => group.pointsLostMicroPoints > 0 || group.matchClass === "UNKNOWN").sort((a, b) => b.pointsLostMicroPoints - a.pointsLostMicroPoints).slice(0, 3).map((group) => group.canonicalName);
    return { jobId: job.id, score: analysis.displayedScore, evidenceQuality: analysis.evidenceQuality, evidenceSufficient: analysis.numericScoreEligibility, priority: analysis.applyPriority, confirmedBlockerCount: analysis.confirmedBlockerCount, topMatches, topGaps };
  });
  return <ComparisonPage jobs={DEMO_JOBS} analyses={analyses} />;
}
