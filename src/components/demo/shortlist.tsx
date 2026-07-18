"use client";

import Link from "next/link";
import { ArrowUpRight, Bookmark, CalendarDays, CheckCircle2, Info, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import { useDemoTracker } from "@/components/demo/demo-store";
import { DEMO_DISCOVERY_PROFILE } from "@/lib/discovery";
import type { DemoJob } from "@/lib/demo-contract";
import { buildTodayShortlist, freshnessLabel, SHORTLIST_POLICY, SHORTLIST_POLICY_VERSION, type ShortlistAnalysis } from "@/lib/shortlist";

export function TodayShortlist({ jobs, analyses }: { jobs: DemoJob[]; analyses: ShortlistAnalysis[] }) {
  const tracker = useDemoTracker();
  const shortlist = buildTodayShortlist(jobs, analyses, DEMO_DISCOVERY_PROFILE);
  return (
    <div className="min-h-screen bg-[#fbf7ed] pb-20 text-[#173d2d]">
      <DemoHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <section className="grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div><p className="eyebrow"><Sparkles className="size-4" /> A smaller queue for a tired job seeker</p><h1 className="mt-4 max-w-4xl font-serif text-5xl tracking-tight sm:text-6xl">Today&apos;s 3 Roles Worth Your Time</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#587064]">Three transparent next decisions—not another endless feed. Every selection follows visible evidence, practical compatibility, freshness, and a stable tie-break.</p></div>
          <aside className="rounded-3xl border border-[#315c49]/15 bg-[#e8efe6] p-6"><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="size-5 text-[#a1742d]" /> No hidden shortlist score</div><p className="mt-3 text-sm leading-7 text-[#486458]">Distance, Remote status, and freshness help order attention. They never add, remove, or modify technical Fit Score points.</p></aside>
        </section>

        <section aria-label="Today's shortlisted roles" className="mt-9 grid gap-5 lg:grid-cols-3">
          {shortlist.map((row) => {
            const saved = Boolean(tracker.records[row.job.id]);
            return <article key={row.job.id} className="flex min-w-0 flex-col rounded-3xl border border-[#173d2d]/10 bg-[#fffdf7] p-5 shadow-[0_18px_50px_rgba(39,61,49,.08)]">
              <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#a1742d]">Worth your time #{row.rank}</p><p className="mt-2 text-sm font-bold text-[#517061]">{row.job.company}</p><h2 className="mt-1 font-serif text-2xl leading-tight">{row.job.title}</h2></div><div aria-label={row.analysis.score === null ? "Insufficient evidence" : `Fit Score ${row.analysis.score}`} className="grid size-20 shrink-0 place-items-center rounded-full border-[7px] border-[#87a48e] bg-[#edf3eb] text-center">{row.analysis.score === null ? <span className="px-1 text-[10px] font-bold leading-tight">NO NUMERIC<br />SCORE</span> : <span><strong className="block text-2xl leading-none">{row.analysis.score}</strong><small className="mt-1 block text-[10px] font-bold">FIT</small></span>}</div></div>
              <div className="mt-5 flex flex-wrap gap-2 text-xs"><span className="pill"><MapPin className="size-3" /> {row.distanceLabel}</span><span className="pill"><CalendarDays className="size-3" /> {freshnessLabel(row.job.postedAt)}</span><span className="pill">Evidence {row.analysis.evidenceQuality.toFixed(1)}</span></div>
              <div className={`mt-4 rounded-xl px-3 py-2 text-xs font-bold ${row.analysis.confirmedBlockerCount ? "bg-[#f8e6df] text-[#7b4037]" : "bg-[#edf4ea] text-[#315c49]"}`}>Apply Priority: {row.analysis.priority.replaceAll("_", " ")} · {row.analysis.confirmedBlockerCount ? `${row.analysis.confirmedBlockerCount} blocker` : "No confirmed blocker"}</div>
              <dl className="mt-5 space-y-4 border-t border-[#173d2d]/10 pt-5 text-sm"><div><dt className="metric-label">Strongest match</dt><dd className="mt-1 font-semibold text-[#315c49]">{row.analysis.strongestCapability}</dd></div><div><dt className="metric-label">Biggest gap</dt><dd className="mt-1 font-semibold text-[#805d31]">{row.analysis.largestGap}</dd></div><div><dt className="metric-label">Why selected</dt><dd className="mt-1 leading-6 text-[#587064]">{row.selectionReason}</dd></div></dl>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-6"><button type="button" className="button-secondary justify-center" onClick={() => tracker.toggleSaved(row.job.id)} aria-label={`${saved ? "Unsave" : "Save"} ${row.job.title}`}><Bookmark className="size-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button><Link href={`/demo/jobs/${row.job.id}`} className="button-secondary justify-center">Review evidence</Link><a href={`/demo/employer-posting/${row.job.id}`} target="_blank" rel="noopener noreferrer" onClick={() => tracker.recordEvent("EMPLOYER_DESTINATION_OPENED", row.job.id)} className="button-primary col-span-2 justify-center">Apply on Employer Site <ArrowUpRight className="size-4" /></a></div>
            </article>;
          })}
        </section>

        <section className="mt-9 grid gap-5 lg:grid-cols-[1fr_.8fr]">
          <article className="paper-card"><p className="eyebrow"><Info className="size-4" /> Exact shortlist policy</p><h2 className="mt-3 font-serif text-3xl">Ordered lexicographic factors</h2><ol className="mt-5 space-y-3 text-sm leading-6">{SHORTLIST_POLICY.map((item, index) => <li key={item} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#173d2d] text-xs font-bold text-[#fffaf0]">{index + 1}</span><span className="pt-0.5">{item}</span></li>)}</ol><p className="mt-5 text-xs text-[#687d72]">Policy version: <code>{SHORTLIST_POLICY_VERSION}</code>. No weights are combined, and no hidden total is calculated.</p></article>
          <article className="paper-card"><CheckCircle2 className="size-6 text-[#a1742d]" /><h2 className="mt-4 font-serif text-3xl">Keep control of the next step</h2><p className="mt-4 text-sm leading-7 text-[#587064]">Save a role locally, inspect the evidence, or deliberately open the fictional employer destination. JobPilot never fills a form, sends a resume, or changes the tracker to Applied.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/demo/jobs" className="button-secondary">Explore all roles</Link><Link href="/demo/tracker" className="button-primary">Open tracker</Link></div></article>
        </section>
      </main>
    </div>
  );
}
