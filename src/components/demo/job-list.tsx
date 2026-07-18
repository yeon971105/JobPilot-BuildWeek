"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, Filter, MapPin, Search, X } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import { useDemoTracker } from "@/components/demo/demo-store";
import { usePrivateProfile } from "@/components/profile/profile-store";
import type { DemoJob } from "@/lib/demo-contract";

export type JobCardAnalysis = {
  jobId: string;
  score: number | null;
  evidenceQuality: number;
  evidenceSufficient: boolean;
  strongestCapability: string;
  largestGap: string;
  priority: string;
  confirmedBlockerCount: number;
};

export function JobList({ jobs, analyses, showTour }: { jobs: DemoJob[]; analyses: JobCardAnalysis[]; showTour: boolean }) {
  const tracker = useDemoTracker();
  const profile = usePrivateProfile();
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("ALL");
  const [seniority, setSeniority] = useState("ALL");
  const [minimum, setMinimum] = useState(0);
  const [sufficientOnly, setSufficientOnly] = useState(false);
  const [priority, setPriority] = useState("ALL");
  const [blocker, setBlocker] = useState("ALL");
  const [tourVisible, setTourVisible] = useState(showTour);
  const privateActive = profile.mode === "PRIVATE" && Boolean(profile.profile);
  const analysisById = useMemo(() => new Map(analyses.map((analysis) => {
    const local = profile.analyses[analysis.jobId]?.analysis;
    if (!privateActive) return [analysis.jobId, analysis] as const;
    if (!local) return [analysis.jobId, { ...analysis, score: null, evidenceQuality: 0, evidenceSufficient: false, strongestCapability: "Run local analysis", largestGap: "Not analyzed yet", priority: "NEEDS_REVIEW", confirmedBlockerCount: 0 }] as const;
    const strongest = [...local.capabilityGroups].filter((group) => group.earnedMidMicroPoints > 0).sort((a, b) => b.earnedMidMicroPoints - a.earnedMidMicroPoints)[0];
    const gap = [...local.capabilityGroups].filter((group) => group.pointsLostMicroPoints > 0).sort((a, b) => b.pointsLostMicroPoints - a.pointsLostMicroPoints)[0];
    return [analysis.jobId, { jobId: analysis.jobId, score: local.displayedScore, evidenceQuality: local.evidenceQuality, evidenceSufficient: local.numericScoreEligibility, strongestCapability: strongest?.canonicalName ?? "No confirmed match", largestGap: gap?.canonicalName ?? "No confirmed point loss", priority: local.applyPriority, confirmedBlockerCount: local.confirmedBlockerCount }] as const;
  })), [analyses, privateActive, profile.analyses]);
  const filtered = useMemo(() => jobs.filter((job) => {
    const analysis = analysisById.get(job.id)!;
    const haystack = `${job.title} ${job.company}`.toLowerCase();
    const modeMatch = workMode === "ALL" || job.locations.some((location) => location.workModes.includes(workMode));
    const seniorityMatch = seniority === "ALL" || job.seniority === seniority;
    const minimumMatch = analysis.score === null ? minimum === 0 : analysis.score >= minimum;
    const priorityMatch = priority === "ALL" || analysis.priority === priority;
    const blockerMatch = blocker === "ALL" || (blocker === "BLOCKED" ? analysis.confirmedBlockerCount > 0 : analysis.confirmedBlockerCount === 0);
    return haystack.includes(query.toLowerCase().trim()) && modeMatch && seniorityMatch && minimumMatch && (!sufficientOnly || analysis.evidenceSufficient) && priorityMatch && blockerMatch;
  }), [analysisById, blocker, jobs, minimum, priority, query, seniority, sufficientOnly, workMode]);

  const filters = <FilterFields workMode={workMode} setWorkMode={setWorkMode} seniority={seniority} setSeniority={setSeniority} minimum={minimum} setMinimum={setMinimum} sufficientOnly={sufficientOnly} setSufficientOnly={setSufficientOnly} priority={priority} setPriority={setPriority} blocker={blocker} setBlocker={setBlocker} />;
  return (
    <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]">
      <DemoHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        {tourVisible && <aside className="mb-7 flex items-start justify-between gap-4 rounded-2xl border border-[#b89a56]/30 bg-[#fff4d8] p-4" aria-label="Guided tour"><div><p className="text-sm font-bold text-[#7b5720]">Your 90-second path</p><p className="mt-1 text-sm leading-6 text-[#6f6248]">Open a role, inspect its evidence and receipt, build the prepared strategy, save it, move it in the tracker, then visit the Trust Lab.</p></div><button type="button" aria-label="Dismiss guided tour" onClick={() => setTourVisible(false)}><X className="size-5" /></button></aside>}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="eyebrow">Original fictional catalog</p><h1 className="mt-3 max-w-3xl font-serif text-5xl tracking-tight">Find the evidence worth acting on.</h1><p className="mt-3 font-semibold text-[#315c49]">Showing fit for {privateActive ? "Private Local Resume" : "Demo Candidate A"}</p><div className="mt-3 flex flex-wrap gap-4 text-sm"><Link href="/profile" className="font-bold underline underline-offset-4">Change Profile</Link><Link href="/profile/resume" className="font-bold underline underline-offset-4">Use My Resume Privately</Link></div></div>
          <Link href="/demo/trust" className="button-secondary">Inspect the Trust Lab</Link>
        </div>
        <div className="mt-8 grid gap-7 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block"><div className="sticky top-24 rounded-2xl border border-[#173d2d]/10 bg-white/65 p-5"><h2 className="flex items-center gap-2 font-bold"><Filter className="size-4" /> Filters</h2><div className="mt-5">{filters}</div></div></aside>
          <section aria-labelledby="job-results-title">
            <h2 id="job-results-title" className="sr-only">Job results</h2>
            <div data-testid="filter-toolbar" className="flex gap-3">
              <label className="relative block flex-1"><Search className="absolute left-4 top-3.5 size-5 text-[#72857a]" /><span className="sr-only">Search by title or company</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or company" className="w-full rounded-xl border border-[#173d2d]/15 bg-white py-3 pl-12 pr-4" /></label>
              <details className="relative lg:hidden"><summary className="button-secondary list-none"><Filter className="size-4" /> Filters</summary><div className="absolute right-0 z-20 mt-2 w-[min(86vw,320px)] rounded-2xl border border-[#173d2d]/10 bg-[#fffaf0] p-5 shadow-xl">{filters}</div></details>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#677c71]"><p aria-live="polite">{filtered.length} role{filtered.length === 1 ? "" : "s"}</p><p>Sorted by stable demo order</p></div>
            <div className="mt-4 grid gap-5 xl:grid-cols-2">
              {filtered.map((job) => <JobCard key={job.id} job={job} analysis={analysisById.get(job.id)!} saved={Boolean(tracker.records[job.id])} onToggle={() => tracker.toggleSaved(job.id)} />)}
            </div>
            {!filtered.length && <div className="mt-4 rounded-2xl border border-dashed border-[#173d2d]/20 bg-white/60 p-12 text-center"><h2 className="font-serif text-2xl">No roles match those filters.</h2><p className="mt-2 text-[#657a70]">Clear a filter or lower the minimum Fit Score.</p><button type="button" className="button-secondary mt-5" onClick={() => { setQuery(""); setWorkMode("ALL"); setSeniority("ALL"); setMinimum(0); setSufficientOnly(false); setPriority("ALL"); setBlocker("ALL"); }}>Clear filters</button></div>}
          </section>
        </div>
      </main>
    </div>
  );
}

function FilterFields(props: { workMode: string; setWorkMode: (value: string) => void; seniority: string; setSeniority: (value: string) => void; minimum: number; setMinimum: (value: number) => void; sufficientOnly: boolean; setSufficientOnly: (value: boolean) => void; priority: string; setPriority: (value: string) => void; blocker: string; setBlocker: (value: string) => void }) {
  return <div className="space-y-5 text-sm"><label className="block font-semibold">Work mode<select value={props.workMode} onChange={(event) => props.setWorkMode(event.target.value)} className="form-control"><option value="ALL">All modes</option><option>REMOTE</option><option>HYBRID</option><option>ONSITE</option></select></label><label className="block font-semibold">Seniority<select value={props.seniority} onChange={(event) => props.setSeniority(event.target.value)} className="form-control"><option value="ALL">All levels</option><option value="ENTRY_LEVEL">Entry level</option><option value="MID_LEVEL">Mid level</option><option value="SENIOR">Senior</option><option value="LEAD">Lead</option></select></label><label className="block font-semibold">Apply Priority<select value={props.priority} onChange={(event) => props.setPriority(event.target.value)} className="form-control"><option value="ALL">All priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option><option value="NEEDS_REVIEW">Needs review</option><option value="CONFIRMED_CONSTRAINT">Confirmed constraint</option></select></label><label className="block font-semibold">Practical blocker<select value={props.blocker} onChange={(event) => props.setBlocker(event.target.value)} className="form-control"><option value="ALL">All blocker states</option><option value="CLEAR">No confirmed blocker</option><option value="BLOCKED">Confirmed blocker</option></select></label><label className="block font-semibold">Minimum Fit Score: {props.minimum}<input type="range" min="0" max="90" step="5" value={props.minimum} onChange={(event) => props.setMinimum(Number(event.target.value))} className="mt-2 w-full accent-[#315c49]" /></label><label className="flex items-start gap-2 font-semibold"><input type="checkbox" checked={props.sufficientOnly} onChange={(event) => props.setSufficientOnly(event.target.checked)} className="mt-0.5 size-4 accent-[#315c49]" /> Evidence sufficient</label></div>;
}

function JobCard({ job, analysis, saved, onToggle }: { job: DemoJob; analysis: JobCardAnalysis; saved: boolean; onToggle: () => void }) {
  return <article data-testid="job-card" className="paper-card flex min-h-[390px] flex-col"><div className="flex justify-between gap-4"><div><p className="text-sm font-bold text-[#a1742d]">{job.company}</p><h2 className="mt-2 font-serif text-2xl leading-tight">{job.title}</h2><p className="mt-3 flex items-start gap-2 text-sm text-[#657a70]"><MapPin className="mt-0.5 size-4 shrink-0" />{job.locations.map((location) => location.label).join(" · ")}</p></div><div data-testid="job-score" className={`grid size-20 shrink-0 place-items-center rounded-full border-[7px] text-center ${analysis.score === null ? "border-[#c6bfae] bg-[#f1ede3]" : "border-[#87a48e] bg-[#edf3eb]"}`}>{analysis.score === null ? <span className="px-1 text-[11px] font-bold leading-tight">INSUFFICIENT<br />EVIDENCE</span> : <span><strong className="block font-sans text-2xl leading-none">{analysis.score}</strong><small className="mt-1 block text-[11px] font-bold tracking-[.12em]">FIT</small></span>}</div></div><div className="mt-4 flex flex-wrap gap-2">{[...new Set(job.locations.flatMap((location) => location.workModes))].map((mode) => <span key={mode} className="pill">{mode}</span>)}<span className="pill">{job.seniority.replaceAll("_", " ")}</span></div><dl className="mt-5 grid gap-3 border-t border-[#173d2d]/10 pt-4 text-sm"><div><dt className="metric-label">Evidence Quality</dt><dd className="mt-1 font-semibold">{analysis.evidenceSufficient ? `${analysis.evidenceQuality.toFixed(1)} / 100` : "Not established"}</dd></div><div><dt className="metric-label">Strongest match</dt><dd className="mt-1 font-semibold text-[#315c49]">{analysis.strongestCapability}</dd></div><div><dt className="metric-label">Biggest gap</dt><dd className="mt-1 font-semibold text-[#805d31]">{analysis.largestGap}</dd></div></dl><div className={`mt-4 flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold ${analysis.confirmedBlockerCount ? "bg-[#f8e6df] text-[#7b4037]" : "bg-[#edf4ea] text-[#315c49]"}`}><span>Priority: {analysis.priority.replaceAll("_", " ")}</span><span>{analysis.confirmedBlockerCount ? `${analysis.confirmedBlockerCount} blocker` : "No confirmed blocker"}</span></div><div className="mt-auto flex items-center gap-3 pt-5"><button type="button" onClick={onToggle} aria-label={`${saved ? "Unsave" : "Save"} ${job.title}`} className="button-secondary"><Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button><Link href={`/demo/jobs/${job.id}`} className="button-primary flex-1 justify-center">Open Role <ArrowRight className="size-4" /></Link></div></article>;
}
