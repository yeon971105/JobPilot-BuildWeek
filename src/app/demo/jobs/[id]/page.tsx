import { notFound } from "next/navigation";
import { DemoDetail } from "@/components/demo/demo-shell";
import { getDemoJob } from "@/lib/build-week-demo";
import { getDemoProviderConfig } from "@/server/build-week/strategy";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const job = getDemoJob(id); if (!job) notFound(); return <DemoDetail job={job} initialMode={getDemoProviderConfig().mode} />; }
