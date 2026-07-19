"use client";

import Link from "next/link";
import { Bookmark, CalendarClock, CheckCircle2, FileCheck2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import { DestinationAction } from "@/components/demo/destination-action";
import { useDemoTracker } from "@/components/demo/demo-store";
import { fitPresentation } from "@/lib/decision-presentation";
import { humanizeMachineValue } from "@/lib/display-language";
import { DEMO_DISCOVERY_PROFILE } from "@/lib/discovery";
import type { DemoJob } from "@/lib/demo-contract";
import { buildTodayShortlist, SHORTLIST_POLICY, SHORTLIST_POLICY_VERSION, type ShortlistAnalysis } from "@/lib/shortlist";

export function TodayShortlist({ jobs, analyses }: { jobs: DemoJob[]; analyses: ShortlistAnalysis[] }) {
  const tracker = useDemoTracker();
  const shortlist = buildTodayShortlist(jobs, analyses, DEMO_DISCOVERY_PROFILE);
  return (
    <div className="min-h-screen bg-[#fbf7ed] pb-20 text-[#173d2d]">
      <DemoHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <section className="page-enter grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div><p className="eyebrow"><Sparkles className="size-4" /> Your focused starting point</p><h1 className="mt-4 max-w-4xl font-serif text-5xl tracking-tight sm:text-6xl">Today&apos;s 3 Roles Worth Your Time</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-[#587064]">Three focused next decisions—not another endless feed.</p></div>
          <aside className="rounded-3xl border border-[#315c49]/15 bg-[#e8efe6] p-6"><div className="flex items-center gap-2 text-sm font-bold"><ShieldCheck className="size-5 text-[#a1742d]" /> No hidden shortlist score.</div><p className="mt-3 text-sm leading-7 text-[#486458]">These roles rise through visible evidence, preference fit, and freshness. None of those factors changes the technical Fit Score.</p></aside>
        </section>

        <section aria-labelledby="shortlist-why" className="mt-7 rounded-3xl border border-[#173d2d]/10 bg-[#fffdf7]/80 p-5">
          <h2 id="shortlist-why" className="font-serif text-2xl">Why these three?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><Reason icon={<FileCheck2 className="size-5" />} title="Best evidence fit" text="The strongest supported fit rises first." /><Reason icon={<MapPin className="size-5" />} title="Works with your preferences" text="Location, work mode, and blockers remain visible." /><Reason icon={<CalendarClock className="size-5" />} title="Recent enough to act on" text="Fresh roles come before older ties." /></div>
          <p className="mt-4 text-sm font-bold">No hidden shortlist score.</p>
          <details className="mt-2 rounded-xl border border-[#173d2d]/10 bg-white/60 p-4"><summary className="min-h-11 font-bold">See the full ranking method</summary><ol className="mt-3 space-y-2 text-sm leading-6 text-[#587064]">{SHORTLIST_POLICY.map((item, index) => <li key={item}>{index + 1}. {item}</li>)}</ol><p className="mt-3 text-xs">Policy <code>{SHORTLIST_POLICY_VERSION}</code>. No hidden total is calculated.</p></details>
        </section>

        <section aria-label="Today's shortlisted roles" className="mt-9 grid gap-5 lg:grid-cols-3">
          {shortlist.map((row) => {
            const saved = Boolean(tracker.records[row.job.id]);
            const fit = fitPresentation(row.analysis.score);
            const freshness = row.rationale.find((item) => item.label === "Freshness")?.value;
            const distance = row.distanceMiles === null ? row.distanceLabel : `${Math.round(row.distanceMiles)} miles`;
            return <article key={row.job.id} style={{ animationDelay: `${(row.rank - 1) * 40}ms` }} className="shortlist-card flex min-w-0 flex-col rounded-3xl border border-[#173d2d]/10 bg-[#fffdf7] p-5 shadow-[0_18px_50px_rgba(39,61,49,.08)]">
              <div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#a1742d]">Worth your time #{row.rank}</p><p className="mt-2 text-sm font-bold text-[#517061]">{row.job.company}</p><h2 className="mt-1 font-serif text-2xl leading-tight">{row.job.title}</h2></div><div aria-label={row.analysis.score === null ? "Insufficient evidence" : `Fit Score ${row.analysis.score}`} className="score-ring grid size-20 shrink-0 place-items-center rounded-full border-[7px] border-[#87a48e] bg-[#edf3eb] text-center">{row.analysis.score === null ? <span className="px-1 text-[9px] font-bold leading-tight">INSUFFICIENT<br />EVIDENCE</span> : <span><strong className="block text-2xl leading-none">{row.analysis.score}</strong><small className="mt-1 block text-[10px] font-bold">FIT</small></span>}</div></div>
              <div className="mt-4 flex flex-wrap gap-2"><span className="pill">{humanizeMachineValue(fit.label)}</span><span className="pill">{distance}</span>{freshness && <span className="pill">{freshness}</span>}</div>
              <dl aria-label="Decision summary" className="mt-5 grid gap-3 border-t border-[#173d2d]/10 pt-5 text-sm"><div><dt className="metric-label">Strongest evidence</dt><dd className="mt-1 font-semibold text-[#315c49]">{row.analysis.strongestCapability}</dd></div><div><dt className="metric-label">One attention area</dt><dd className="mt-1 font-semibold text-[#805d31]">{row.analysis.largestGap}</dd></div><div><dt className="metric-label">Destination</dt><dd className="mt-1 font-semibold">Verified fictional employer handoff</dd></div></dl>
              <div className="mt-auto grid grid-cols-2 gap-2 pt-6"><button type="button" className="button-secondary justify-center" onClick={() => tracker.toggleSaved(row.job.id)} aria-label={`${saved ? "Unsave" : "Save"} ${row.job.title}`}><Bookmark className="size-4" fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}</button><Link href={`/demo/jobs/${row.job.id}`} className="button-secondary justify-center">Review Role</Link><DestinationAction jobId={row.job.id} onOpen={() => tracker.recordEvent("EMPLOYER_DESTINATION_OPENED", row.job.id)} className="button-primary col-span-2 justify-center" statusClassName="col-span-2 rounded-xl bg-[#fff4d8] px-4 py-3 text-center text-sm font-bold text-[#6c5731]" /></div>
            </article>;
          })}
        </section>

        <section className="mt-9"><article className="paper-card"><CheckCircle2 className="size-6 text-[#a1742d]" /><h2 className="mt-4 font-serif text-3xl">Keep control of the next step</h2><p className="mt-4 max-w-3xl text-sm leading-7 text-[#587064]">Save a role locally, inspect the evidence, or deliberately open the fictional employer destination. JobPilot never fills a form, sends a resume, or changes the tracker to Applied.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/demo/jobs" className="button-secondary">Explore all roles</Link><Link href="/demo/tracker" className="button-primary">Open tracker</Link></div></article></section>
      </main>
    </div>
  );
}

function Reason({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex items-start gap-3 rounded-2xl bg-[#edf1e8] p-4"><span className="mt-0.5 text-[#a1742d]" aria-hidden="true">{icon}</span><div><p className="font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-[#587064]">{text}</p></div></div>;
}
