import { notFound } from "next/navigation";
import { JobDetail } from "@/components/demo/job-detail";
import { DEMO_CANDIDATE, DEMO_JOBS, getDemoJob } from "@/lib/demo-contract";
import { relevantExperienceYears, scoreJob } from "@/server/build-week/scorer";
import { getDemoProviderConfig } from "@/server/build-week/strategy";

export function generateStaticParams() { return DEMO_JOBS.map((job) => ({ id: job.id })); }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getDemoJob(id);
  if (!job) notFound();
  const analysis = scoreJob(job);
  const experienceRows = job.requirements.filter((requirement) => requirement.requestedYears).map((requirement) => {
    const relevantYears = relevantExperienceYears([
      { startMonth: "2023-01", endMonth: "2025-12", coefficient: 1 },
      { startMonth: "2021-07", endMonth: "2023-06", coefficient: 0.3 },
    ]);
    const scored = analysis.capabilityGroups.find((group) => group.id === requirement.id)!;
    return { requirementId: requirement.id, requestedYears: requirement.requestedYears!, relevantYears, intervals: ["role-synthetic-1: 2023-01–2025-12", "role-synthetic-2: 2021-07–2023-06"], coefficients: ["EXACT_DOMAIN 1.00", "TRANSFERABLE 0.30"], overlappingMonthsRemoved: 6, maximumPoints: scored.maximumMicroPoints / 1_000_000, earnedPoints: scored.earnedMidMicroPoints / 1_000_000 };
  });
  return <JobDetail job={job} candidate={DEMO_CANDIDATE} analysis={analysis} initialMode={getDemoProviderConfig().mode} experienceRows={experienceRows} />;
}
