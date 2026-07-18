"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, MapPin, Scale, X } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import { useDemoTracker } from "@/components/demo/demo-store";
import { DEMO_DISCOVERY_PROFILE, buildDiscoveryRow, formatPostedDate } from "@/lib/discovery";
import type { DemoJob } from "@/lib/demo-contract";

export type ComparisonAnalysis = {
  jobId: string;
  score: number | null;
  evidenceQuality: number;
  evidenceSufficient: boolean;
  priority: string;
  confirmedBlockerCount: number;
  topMatches: string[];
  topGaps: string[];
};

export function ComparisonPage({ jobs, analyses }: { jobs: DemoJob[]; analyses: ComparisonAnalysis[] }) {
  const tracker = useDemoTracker();
  const analysisById = new Map(analyses.map((analysis) => [analysis.jobId, analysis]));
  const selected = tracker.comparisonIds.map((id) => jobs.find((job) => job.id === id)).filter((job): job is DemoJob => Boolean(job)).slice(0, 3);
  return <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]"><DemoHeader /><main className="mx-auto max-w-7xl px-5 py-10"><Link href="/demo/jobs" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#315c49]"><ArrowLeft className="size-4" /> Back to nearby jobs</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow"><Scale className="size-4" /> Compare visible decision factors</p><h1 className="mt-3 font-serif text-5xl">Which role deserves attention first?</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-[#587064]">Compare up to three roles without an opaque aggregate score. Fit, evidence, gaps, practical constraints, distance, and recency remain visible.</p></div><Link href="/demo/jobs" className="button-secondary">Replace a role</Link></div>{selected.length === 0 ? <section className="paper-card mt-8 text-center"><h2 className="font-serif text-3xl">Select two or three roles first.</h2><p className="mt-3 text-[#587064]">Use the Compare control on any nearby job card.</p><Link href="/demo/jobs" className="button-primary mt-6">Choose roles</Link></section> : <div data-testid="comparison-grid" className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{selected.map((job) => <ComparisonCard key={job.id} job={job} analysis={analysisById.get(job.id)!} remove={() => tracker.toggleComparison(job.id)} onEmployerOpen={() => tracker.recordEvent("EMPLOYER_DESTINATION_OPENED", job.id)} />)}</div>}<section className="mt-8 rounded-3xl bg-[#173d2d] p-6 text-[#fffaf0]"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#d9c992]">Ranking contract</p><h2 className="mt-2 font-serif text-3xl">No hidden comparison formula</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-[#dce9df]">The comparison creates no new score. Decide from the same deterministic Fit Score, Evidence Quality, blockers, distance, recency, required and preferred evidence, and direct employer destination shown on each card.</p></section></main></div>;
}

function ComparisonCard({ job, analysis, remove, onEmployerOpen }: { job: DemoJob; analysis: ComparisonAnalysis; remove: () => void; onEmployerOpen: () => void }) {
  const row = buildDiscoveryRow(job, analysis, DEMO_DISCOVERY_PROFILE);
  const requiredExperience = job.requirements.filter((item) => item.scoringClass === "CORE" && (item.requestedYears || item.dimension === "EXPERIENCE_AND_SENIORITY"));
  const preferredExperience = job.requirements.filter((item) => item.scoringClass === "PREFERRED" && (item.requestedYears || item.preferredCategory === "EXPERIENCE"));
  return <article className="paper-card flex flex-col" data-testid="comparison-card"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#a1742d]">{job.company}</p><h2 className="mt-2 font-serif text-2xl">{job.title}</h2></div><button type="button" onClick={remove} aria-label={`Remove ${job.title} from comparison`} className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#173d2d]/10"><X className="size-4" /></button></div><p className="mt-3 flex gap-2 text-sm text-[#62796f]"><MapPin className="size-4 shrink-0" />{row.distanceLabel} · {job.locations.map((item) => item.label).join(" · ")}</p><dl className="mt-5 grid grid-cols-2 gap-3"><Metric label="Fit Score" value={analysis.score === null ? "Insufficient Evidence" : `${analysis.score} / 100`} /><Metric label="Evidence Quality" value={`${analysis.evidenceQuality.toFixed(1)} / 100`} /><Metric label="Apply Priority" value={analysis.priority.replaceAll("_", " ")} /><Metric label="Blocker" value={analysis.confirmedBlockerCount ? `${analysis.confirmedBlockerCount} confirmed` : "None confirmed"} /><Metric label="Posted" value={formatPostedDate(job.postedAt)} /><Metric label="Work mode" value={[...new Set(job.locations.flatMap((item) => item.workModes))].join(" · ")} /></dl><CompareList title="Required experience" items={requiredExperience.length ? requiredExperience.map((item) => `${item.canonicalName}${item.requestedYears ? ` · ${item.requestedYears}+ years` : ""}`) : ["No numeric required-experience statement"]} /><CompareList title="Preferred experience" items={preferredExperience.length ? preferredExperience.map((item) => `${item.canonicalName}${item.requestedYears ? ` · ${item.requestedYears}+ years` : ""}`) : ["No numeric preferred-experience statement"]} /><CompareList title="Top matches" items={analysis.topMatches.slice(0, 3)} tone="positive" /><CompareList title="Biggest gaps" items={analysis.topGaps.slice(0, 3)} /><div className="mt-auto grid gap-2 pt-6"><Link href={`/demo/jobs/${job.id}`} className="button-primary justify-center">Open role</Link><a href={`/demo/employer-posting/${job.id}`} target="_blank" rel="noopener noreferrer" onClick={onEmployerOpen} className="button-secondary justify-center">Employer destination <ArrowUpRight className="size-4" /></a></div></article>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#edf1e8] p-3"><dt className="metric-label">{label}</dt><dd className="mt-1 text-sm font-bold leading-5">{value}</dd></div>; }
function CompareList({ title, items, tone = "neutral" }: { title: string; items: string[]; tone?: "neutral" | "positive" }) { return <section className="mt-5"><h3 className="text-xs font-bold uppercase tracking-[.12em] text-[#6f8278]">{title}</h3><ul className="mt-2 space-y-2 text-sm leading-6">{items.length ? items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className={`mt-1 size-4 shrink-0 ${tone === "positive" ? "text-[#4e7a63]" : "text-[#a1742d]"}`} />{item}</li>) : <li>None identified.</li>}</ul></section>; }
