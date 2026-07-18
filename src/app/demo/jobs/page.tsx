import { JobList, type JobCardAnalysis } from "@/components/demo/job-list";
import { DEMO_JOBS } from "@/lib/demo-contract";
import { scoreJob } from "@/server/build-week/scorer";

export default async function Page({ searchParams }: { searchParams: Promise<{ tour?: string }> }) {
  const { tour } = await searchParams;
  const analyses: JobCardAnalysis[] = DEMO_JOBS.map((job) => {
    const analysis = scoreJob(job);
    const strongest = [...analysis.capabilityGroups].filter((group) => group.earnedMidMicroPoints > 0).sort((a, b) => b.earnedMidMicroPoints - a.earnedMidMicroPoints)[0];
    const gap = [...analysis.capabilityGroups].filter((group) => group.pointsLostMicroPoints > 0 || group.matchClass === "UNKNOWN").sort((a, b) => b.pointsLostMicroPoints - a.pointsLostMicroPoints)[0];
    return { jobId: job.id, score: analysis.displayedScore, evidenceQuality: analysis.evidenceQuality, evidenceSufficient: analysis.numericScoreEligibility, strongestCapability: strongest?.canonicalName ?? "Supported evidence only", largestGap: gap?.canonicalName ?? "No confirmed point loss", priority: analysis.applyPriority, confirmedBlockerCount: analysis.confirmedBlockerCount };
  });
  return <JobList jobs={DEMO_JOBS} analyses={analyses} showTour={tour === "1"} />;
}
