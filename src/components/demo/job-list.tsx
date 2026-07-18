"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bookmark, Filter, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import { DestinationAction } from "@/components/demo/destination-action";
import { useDemoTracker } from "@/components/demo/demo-store";
import { usePrivateProfile } from "@/components/profile/profile-store";
import type { DemoJob } from "@/lib/demo-contract";
import { buildDiscoveryRow, DEMO_DISCOVERY_PROFILE, filterDiscoveryRows, formatPostedDate, sortDiscoveryRows, type DiscoveryProfile, type DiscoveryRow, type DiscoverySort } from "@/lib/discovery";

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

export function JobList({ jobs, analyses, initialSort = "BEST_MATCH", showTour }: { jobs: DemoJob[]; analyses: JobCardAnalysis[]; initialSort?: DiscoverySort; showTour: boolean }) {
  const tracker = useDemoTracker();
  const profile = usePrivateProfile();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<DiscoverySort>(initialSort);
  const [workMode, setWorkMode] = useState("ALL");
  const [seniority, setSeniority] = useState("ALL");
  const [minimum, setMinimum] = useState(0);
  const [sufficientOnly, setSufficientOnly] = useState(false);
  const [priority, setPriority] = useState("ALL");
  const [blocker, setBlocker] = useState("ALL");
  const [withinArea, setWithinArea] = useState(false);
  const [remoteCompatible, setRemoteCompatible] = useState(false);
  const [tourVisible, setTourVisible] = useState(showTour);
  const privateActive = profile.mode === "PRIVATE" && Boolean(profile.profile);
  const discoveryProfile: DiscoveryProfile = useMemo(() => privateActive ? {
    label: "Private Local Resume",
    homeCity: profile.preferences.homeCity,
    homeLatitude: profile.preferences.homeLatitude,
    homeLongitude: profile.preferences.homeLongitude,
    preferredRadiusMiles: profile.preferences.preferredRadiusMiles,
    acceptedWorkModes: profile.preferences.acceptedWorkModes,
    remotePreference: profile.preferences.remotePreference,
  } : DEMO_DISCOVERY_PROFILE, [privateActive, profile.preferences.acceptedWorkModes, profile.preferences.homeCity, profile.preferences.homeLatitude, profile.preferences.homeLongitude, profile.preferences.preferredRadiusMiles, profile.preferences.remotePreference]);
  const analysisById = useMemo(() => new Map(analyses.map((analysis) => {
    const local = profile.analyses[analysis.jobId]?.analysis;
    if (!privateActive) return [analysis.jobId, analysis] as const;
    if (!local) return [analysis.jobId, { ...analysis, score: null, evidenceQuality: 0, evidenceSufficient: false, strongestCapability: "Run local analysis", largestGap: "Not analyzed yet", priority: "NEEDS_REVIEW", confirmedBlockerCount: 0 }] as const;
    const strongest = [...local.capabilityGroups].filter((group) => group.earnedMidMicroPoints > 0).sort((a, b) => b.earnedMidMicroPoints - a.earnedMidMicroPoints)[0];
    const gap = [...local.capabilityGroups].filter((group) => group.pointsLostMicroPoints > 0).sort((a, b) => b.pointsLostMicroPoints - a.pointsLostMicroPoints)[0];
    return [analysis.jobId, { jobId: analysis.jobId, score: local.displayedScore, evidenceQuality: local.evidenceQuality, evidenceSufficient: local.numericScoreEligibility, strongestCapability: strongest?.canonicalName ?? "No confirmed match", largestGap: gap?.canonicalName ?? "No confirmed point loss", priority: local.applyPriority, confirmedBlockerCount: local.confirmedBlockerCount }] as const;
  })), [analyses, privateActive, profile.analyses]);
  const rows = useMemo(() => sortDiscoveryRows(filterDiscoveryRows(jobs.map((job) => buildDiscoveryRow(job, analysisById.get(job.id)!, discoveryProfile)), {
    query,
    workMode,
    seniority,
    minimumScore: minimum,
    evidenceSufficientOnly: sufficientOnly,
    priority,
    blocker: blocker as "ALL" | "CLEAR" | "BLOCKED",
    withinPreferredArea: withinArea,
    remoteCompatible,
  }), sort), [analysisById, blocker, discoveryProfile, jobs, minimum, priority, query, remoteCompatible, seniority, sort, sufficientOnly, withinArea, workMode]);

  const resetFilters = () => { setQuery(""); setWorkMode("ALL"); setSeniority("ALL"); setMinimum(0); setSufficientOnly(false); setPriority("ALL"); setBlocker("ALL"); setWithinArea(false); setRemoteCompatible(false); };
  const filters = <FilterFields workMode={workMode} setWorkMode={setWorkMode} seniority={seniority} setSeniority={setSeniority} minimum={minimum} setMinimum={setMinimum} sufficientOnly={sufficientOnly} setSufficientOnly={setSufficientOnly} priority={priority} setPriority={setPriority} blocker={blocker} setBlocker={setBlocker} withinArea={withinArea} setWithinArea={setWithinArea} remoteCompatible={remoteCompatible} setRemoteCompatible={setRemoteCompatible} radius={discoveryProfile.preferredRadiusMiles} />;
  return (
    <div className="min-h-screen bg-[#fbf7ed] pb-28 text-[#173d2d]">
      <DemoHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        {tourVisible && <aside className="mb-7 flex items-start justify-between gap-4 rounded-2xl border border-[#b89a56]/30 bg-[#fff4d8] p-4" aria-label="Discovery tip"><div><p className="text-sm font-bold text-[#7b5720]">Start with the roles worth your time</p><p className="mt-1 text-sm leading-6 text-[#6f6248]">Change the deterministic sort, narrow by practical fit, select two roles, then compare only visible factors.</p></div><button type="button" aria-label="Dismiss discovery tip" onClick={() => setTourVisible(false)} className="grid size-11 place-items-center"><X className="size-5" /></button></aside>}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="eyebrow">Nearby roles in the processed official-source portfolio</p><h1 className="mt-3 max-w-3xl font-serif text-5xl tracking-tight">Prioritize the next application.</h1><p className="mt-3 font-semibold text-[#315c49]">Prioritized for {discoveryProfile.label} near {discoveryProfile.homeCity}</p><div className="mt-3 flex flex-wrap gap-4 text-sm"><Link href="/profile" className="font-bold underline underline-offset-4">Change Profile</Link><Link href="/profile/preferences" className="font-bold underline underline-offset-4">Edit Location Preferences</Link><Link href="/profile/resume" className="font-bold underline underline-offset-4">Use My Resume Privately</Link></div></div>
          <div className="flex flex-wrap gap-3"><Link href="/demo/shortlist" className="button-primary">Today&apos;s 3 Roles</Link><Link href="/demo/compare" className="button-secondary">Compare Selected ({tracker.comparisonIds.length}/3)</Link></div>
        </div>
        <div className="mt-8 grid gap-7 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block"><div className="sticky top-24 rounded-2xl border border-[#173d2d]/10 bg-white/65 p-5"><h2 className="flex items-center gap-2 font-bold"><Filter className="size-4" /> Filters</h2><div className="mt-5">{filters}</div></div></aside>
          <section aria-labelledby="job-results-title">
            <h2 id="job-results-title" className="sr-only">Job results</h2>
            <div data-testid="filter-toolbar" className="flex flex-wrap gap-3">
              <label className="relative min-w-[220px] flex-1"><Search className="absolute left-4 top-3.5 size-5 text-[#72857a]" /><span className="sr-only">Search by title or company</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or company" className="w-full rounded-xl border border-[#173d2d]/15 bg-white py-3 pl-12 pr-4" /></label>
              <label className="min-w-[220px] text-sm font-bold"><span className="sr-only">Sort roles</span><select data-testid="job-sort" value={sort} onChange={(event) => setSort(event.target.value as DiscoverySort)} className="form-control mt-0"><option value="BEST_MATCH">Best Match</option><option value="NEAREST">Nearest</option><option value="MOST_RECENT">Most Recent</option><option value="HIGHEST_EVIDENCE">Highest Evidence Quality</option></select></label>
              <details className="relative lg:hidden"><summary className="button-secondary list-none"><Filter className="size-4" /> Filters</summary><div className="absolute right-0 z-20 mt-2 w-[min(86vw,320px)] rounded-2xl border border-[#173d2d]/10 bg-[#fffaf0] p-5 shadow-xl">{filters}</div></details>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#677c71]"><p aria-live="polite">{rows.length} role{rows.length === 1 ? "" : "s"}</p><p>Deterministic {sort.replaceAll("_", " ").toLowerCase()} order · stable job-ID tie break</p></div>
            <div className="mt-4 grid gap-5 xl:grid-cols-2">
              {rows.map((row) => <JobCard key={row.job.id} row={row} saved={Boolean(tracker.records[row.job.id])} selected={tracker.comparisonIds.includes(row.job.id)} comparisonFull={tracker.comparisonIds.length >= 3} onToggleSave={() => tracker.toggleSaved(row.job.id)} onToggleComparison={() => tracker.toggleComparison(row.job.id)} onEmployerOpen={() => tracker.recordEvent("EMPLOYER_DESTINATION_OPENED", row.job.id)} />)}
            </div>
            {!rows.length && <div className="mt-4 rounded-2xl border border-dashed border-[#173d2d]/20 bg-white/60 p-12 text-center"><h2 className="font-serif text-2xl">No roles match those filters.</h2><p className="mt-2 text-[#657a70]">Clear a filter or widen your preferred area.</p><button type="button" className="button-secondary mt-5" onClick={resetFilters}>Clear filters</button></div>}
          </section>
        </div>
      </main>
      {tracker.comparisonIds.length > 0 && <ComparisonTray count={tracker.comparisonIds.length} onClear={tracker.clearComparison} />}
    </div>
  );
}

type FilterProps = { workMode: string; setWorkMode: (value: string) => void; seniority: string; setSeniority: (value: string) => void; minimum: number; setMinimum: (value: number) => void; sufficientOnly: boolean; setSufficientOnly: (value: boolean) => void; priority: string; setPriority: (value: string) => void; blocker: string; setBlocker: (value: string) => void; withinArea: boolean; setWithinArea: (value: boolean) => void; remoteCompatible: boolean; setRemoteCompatible: (value: boolean) => void; radius: number };
function FilterFields(props: FilterProps) {
  return <div className="space-y-5 text-sm"><label className="block font-semibold">Work mode<select value={props.workMode} onChange={(event) => props.setWorkMode(event.target.value)} className="form-control"><option value="ALL">All modes</option><option>REMOTE</option><option>HYBRID</option><option>ONSITE</option></select></label><label className="block font-semibold">Seniority<select value={props.seniority} onChange={(event) => props.setSeniority(event.target.value)} className="form-control"><option value="ALL">All levels</option><option value="ENTRY_LEVEL">Entry level</option><option value="MID_LEVEL">Mid level</option><option value="SENIOR">Senior</option><option value="LEAD">Lead</option></select></label><label className="block font-semibold">Apply Priority<select value={props.priority} onChange={(event) => props.setPriority(event.target.value)} className="form-control"><option value="ALL">All priorities</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option><option value="NEEDS_REVIEW">Needs review</option><option value="CONFIRMED_CONSTRAINT">Confirmed constraint</option></select></label><label className="block font-semibold">Practical blocker<select value={props.blocker} onChange={(event) => props.setBlocker(event.target.value)} className="form-control"><option value="ALL">All blocker states</option><option value="CLEAR">No confirmed blocker</option><option value="BLOCKED">Confirmed blocker</option></select></label><label className="block font-semibold">Minimum Fit Score: {props.minimum}<input type="range" min="0" max="90" step="5" value={props.minimum} onChange={(event) => props.setMinimum(Number(event.target.value))} className="mt-2 w-full accent-[#315c49]" /></label><label className="choice-control"><input type="checkbox" checked={props.withinArea} onChange={(event) => props.setWithinArea(event.target.checked)} /> Within preferred area ({props.radius} miles)</label><label className="choice-control"><input type="checkbox" checked={props.remoteCompatible} onChange={(event) => props.setRemoteCompatible(event.target.checked)} /> Remote compatible</label><label className="choice-control"><input type="checkbox" checked={props.sufficientOnly} onChange={(event) => props.setSufficientOnly(event.target.checked)} /> Evidence sufficient</label></div>;
}

function JobCard({ row, saved, selected, comparisonFull, onToggleSave, onToggleComparison, onEmployerOpen }: { row: DiscoveryRow<JobCardAnalysis>; saved: boolean; selected: boolean; comparisonFull: boolean; onToggleSave: () => void; onToggleComparison: () => void; onEmployerOpen: () => void }) {
  const { job, analysis } = row;
  return <article data-testid="job-card" className="paper-card flex min-h-[470px] flex-col"><div className="flex justify-between gap-4"><div><p className="text-sm font-bold text-[#a1742d]">{job.company}</p><h2 className="mt-2 font-serif text-2xl leading-tight">{job.title}</h2><p className="mt-3 flex items-start gap-2 text-sm text-[#657a70]"><MapPin className="mt-0.5 size-4 shrink-0" />{row.distanceLabel} · {job.locations.map((location) => location.label).join(" · ")}</p><p className="mt-2 text-xs text-[#6d8176]">Posted {formatPostedDate(job.postedAt)}</p></div><div data-testid="job-score" className={`grid size-20 shrink-0 place-items-center rounded-full border-[7px] text-center ${analysis.score === null ? "border-[#c6bfae] bg-[#f1ede3]" : "border-[#87a48e] bg-[#edf3eb]"}`}>{analysis.score === null ? <span className="px-1 text-[11px] font-bold leading-tight">INSUFFICIENT<br />EVIDENCE</span> : <span><strong className="block font-sans text-2xl leading-none">{analysis.score}</strong><small className="mt-1 block text-[11px] font-bold tracking-[.12em]">FIT</small></span>}</div></div><div className="mt-4 flex flex-wrap gap-2">{[...new Set(job.locations.flatMap((location) => location.workModes))].map((mode) => <span key={mode} className="pill">{mode}</span>)}<span className="pill">{job.seniority.replaceAll("_", " ")}</span></div><dl className="mt-5 grid gap-3 border-t border-[#173d2d]/10 pt-4 text-sm"><div><dt className="metric-label">Evidence Quality</dt><dd className="mt-1 font-semibold">{analysis.evidenceSufficient ? `${analysis.evidenceQuality.toFixed(1)} / 100` : "Not established"}</dd></div><div><dt className="metric-label">Strongest match</dt><dd className="mt-1 font-semibold text-[#315c49]">{analysis.strongestCapability}</dd></div><div><dt className="metric-label">Biggest gap</dt><dd className="mt-1 font-semibold text-[#805d31]">{analysis.largestGap}</dd></div></dl><div className={`mt-4 flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold ${analysis.confirmedBlockerCount ? "bg-[#f8e6df] text-[#7b4037]" : "bg-[#edf4ea] text-[#315c49]"}`}><span>Priority: {analysis.priority.replaceAll("_", " ")}</span><span>{analysis.confirmedBlockerCount ? `${analysis.confirmedBlockerCount} blocker` : "No confirmed blocker"}</span></div><label className="choice-control mt-4"><input type="checkbox" checked={selected} disabled={!selected && comparisonFull} onChange={onToggleComparison} /> Compare role {selected ? `(${selected ? "selected" : ""})` : comparisonFull ? "(three-role limit reached)" : ""}</label><div className="mt-auto grid grid-cols-2 gap-2 pt-5"><button type="button" onClick={onToggleSave} aria-label={`${saved ? "Unsave" : "Save"} ${job.title}`} className="button-secondary justify-center"><Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button><Link href={`/demo/jobs/${job.id}`} className="button-primary justify-center">Open Role</Link><DestinationAction jobId={job.id} onOpen={onEmployerOpen} className="button-secondary col-span-2 justify-center" statusClassName="col-span-2 rounded-xl bg-[#fff4d8] px-4 py-3 text-center text-sm font-bold text-[#6c5731]" /></div><p className="mt-4 text-[11px] text-[#6d8176]">{job.sourcePortfolioLabel}</p></article>;
}

function ComparisonTray({ count, onClear }: { count: number; onClear: () => void }) {
  return <aside aria-label="Role comparison tray" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-[#173d2d] p-4 text-[#fffaf0] shadow-2xl"><div><p className="font-bold">{count} of 3 roles selected</p><p className="text-xs text-[#dce9df]">Compare visible evidence and practical factors—no hidden aggregate score.</p></div><div className="flex gap-2"><button type="button" onClick={onClear} className="button-secondary border-white/20 bg-white/10 text-white"><SlidersHorizontal className="size-4" /> Clear</button><Link href="/demo/compare" className="button-primary border-[#fffaf0] bg-[#fffaf0] text-[#173d2d]">Compare now</Link></div></aside>;
}
