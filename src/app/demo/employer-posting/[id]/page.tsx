import { notFound } from "next/navigation";
import { EmployerPosting } from "@/components/demo/employer-posting";
import { DEMO_JOBS, getDemoJob } from "@/lib/demo-contract";

export function generateStaticParams() { return DEMO_JOBS.map((job) => ({ id: job.id })); }

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getDemoJob(id);
  if (!job) notFound();
  return <EmployerPosting job={job} />;
}
