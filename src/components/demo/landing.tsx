import Link from "next/link";
import { ArrowRight, Check, FileCheck2, MapPin, SearchCheck } from "lucide-react";
import { CALIBRATION_DISCLOSURE } from "@/lib/demo-contract";
import { SiteNavigation } from "@/components/demo/site-navigation";
import { JudgeTour } from "@/components/demo/judge-tour";

const trust = ["Official-source discovery", "Private resume analysis", "Transparent Fit Score", "No auto-apply"];
const value = [
  ["ONE SEARCH, NOT SIX WEBSITES", "JobPilot brings roles from processed official employer sources into one location-aware view."],
  ["KNOW WHAT DESERVES AN APPLICATION", "Resume evidence, required and preferred qualifications, relevant experience, and practical constraints create a transparent priority."],
  ["GO STRAIGHT TO THE EMPLOYER", "Once a role is worth pursuing, JobPilot opens the original employer application page. It never auto-applies."],
] as const;
const decisionJourney = [
  ["DISCOVER", "See nearby and Remote roles from the processed source portfolio."],
  ["PRIORITIZE", "Start with three roles selected by published deterministic factors."],
  ["UNDERSTAND", "Inspect required, preferred, evidence, experience, and the biggest gap."],
  ["APPLY", "Open the original employer destination only when you choose."],
  ["TRACK", "Record your next step locally—never by automatic submission."],
] as const;

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf7ed] text-[#173d2d]">
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-7 sm:pb-24">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-h-11 items-center font-serif text-2xl font-semibold">JobPilot</Link>
          <SiteNavigation />
        </header>
        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
          <div>
            <p className="eyebrow"><SearchCheck className="size-4" /> NEARBY JOBS, PRIORITIZED FOR YOU</p>
            <h1 className="mt-6 max-w-3xl font-serif text-6xl leading-[.94] tracking-[-.045em] text-[#123426] sm:text-7xl lg:text-[5.5rem]">Find the roles worth your time.</h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[#4b6559]">JobPilot brings together fresh jobs near you from processed official employer sources, compares each role with your resume, and explains which opportunities deserve your time—then takes you directly to the employer’s application page.</p>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-[#315c49]">Stop searching job by job. Discover, compare, and apply from one clear decision view.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/demo/shortlist" className="button-primary">See Today&apos;s 3 Roles <ArrowRight className="size-4" /></Link>
              <Link href="/demo/jobs?sort=BEST_MATCH" className="button-secondary">See My Best Matches</Link>
            </div>
            <p className="mt-3 text-xs font-semibold text-[#667b71]">Try the Demo with synthetic roles—no account required.</p>
            <Link href="/profile/resume" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#315c49] underline decoration-[#b08337] underline-offset-4">Use My Resume Privately</Link>
            <div><JudgeTour /></div>
          </div>
          <HeroArtwork />
        </div>
        <div className="mt-14 grid overflow-hidden rounded-2xl border border-[#173d2d]/10 bg-white/55 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((item) => <div key={item} className="flex items-center gap-2 border-b border-[#173d2d]/10 px-5 py-4 text-sm font-semibold last:border-0 sm:border-r lg:border-b-0"><Check className="size-4 text-[#b08337]" />{item}</div>)}
        </div>
      </section>
      <section className="border-t border-[#173d2d]/10 bg-[#f1eadb] px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {value.map(([title, body], index) => <article key={title} className="paper-card"><span className="font-mono text-xs text-[#a1742d]">0{index + 1}</span><h2 className="mt-5 font-serif text-2xl">{title}</h2><p className="mt-3 leading-7 text-[#587064]">{body}</p></article>)}
        </div>
        <ol aria-label="JobPilot decision journey" className="mx-auto mt-10 grid max-w-6xl overflow-hidden rounded-2xl border border-[#173d2d]/10 bg-[#e8efe6] sm:grid-cols-5">{decisionJourney.map(([stage, description], index) => <li key={stage} className="border-b border-[#173d2d]/10 p-5 last:border-0 sm:border-b-0 sm:border-r"><span className="text-xs font-bold text-[#a1742d]">{index + 1}</span><h2 className="mt-3 text-sm font-bold tracking-[.08em]">{stage}</h2><p className="mt-2 text-xs leading-5 text-[#587064]">{description}</p></li>)}</ol>
        <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-2">
          <Comparison title="Traditional fragmented search" items={["discover across separate feeds and tabs", "prioritize by manually rereading postings", "understand fit without an evidence map", "hunt for the employer application link", "track decisions in another tool"]} />
          <Comparison title="JobPilot’s connected loop" items={["discover nearby and Remote roles together", "prioritize with published visible factors", "understand matches, gaps, and exact proof", "open the employer destination deliberately", "track the next step in browser-local state"]} highlighted />
        </div>
        <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-[#6c7e75]"><p className="max-w-4xl">Roles discovered from the processed portfolio of official and rights-eligible employer sources. Public demonstration roles are synthetic. {CALIBRATION_DISCLOSURE}</p><Link href="/about/coverage" className="font-bold underline underline-offset-4">Inspect production coverage proof</Link></div>
      </section>
    </main>
  );
}

function Comparison({ title, items, highlighted = false }: { title: string; items: string[]; highlighted?: boolean }) {
  return <article className={`rounded-3xl border p-6 ${highlighted ? "border-[#315c49]/20 bg-[#e8efe6]" : "border-[#173d2d]/10 bg-[#fffdf7]"}`}><h2 className="font-serif text-2xl">{title}</h2><ul className="mt-5 space-y-3 text-sm leading-6">{items.map((item) => <li key={item} className="flex items-start gap-2"><Check className="mt-1 size-4 shrink-0 text-[#a1742d]" />{item}</li>)}</ul></article>;
}

function HeroArtwork() {
  return (
    <div data-testid="hero-illustration" aria-label="Illustrative JobPilot workspace showing nearby prioritized roles and a direct employer destination" role="img" className="relative min-h-[570px] overflow-hidden rounded-[2.25rem] border border-white/80 bg-[#e9efe5] p-5 shadow-[0_35px_80px_rgba(37,67,52,.18)] sm:min-h-[620px] sm:p-8">
      <div className="absolute -right-12 -top-12 size-48 rounded-full bg-[#d4c28e]/30 blur-3xl" />
      <div className="paper-card relative max-w-[78%] rotate-[-2deg] sm:max-w-[72%]">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#779080]">Prioritized near Oakland</p>
        <p className="mt-2 font-serif text-2xl">Demo Candidate A</p>
        <p className="mt-1 text-sm text-[#61776c]">Remote or hybrid · 35-mile preference</p>
        <div className="mt-5 space-y-3"><RoleSignal label="Resume evidence" value="Strong" /><RoleSignal label="Location fit" value="Nearby" /><RoleSignal label="Application control" value="You decide" /></div>
      </div>
      <div data-testid="hero-score-ring" className="absolute right-3 top-40 grid size-36 place-items-center rounded-full border-[12px] border-[#b89a56] bg-[#173d2d] text-center text-[#fffaf0] shadow-xl sm:right-9 sm:top-36 sm:size-44 sm:border-[14px]">
        <div><span className="block text-[11px] font-bold uppercase tracking-[.16em] text-[#d9c992]">Example Fit</span><strong className="font-sans text-5xl">78</strong><span className="block text-xs">of 100</span></div>
      </div>
      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[#173d2d]/10 bg-[#fffaf0]/95 p-4 shadow-lg sm:bottom-7 sm:left-14 sm:right-8 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#a1742d]">Synthetic nearby role</p><p className="mt-1 font-serif text-lg leading-tight">Applied AI Solutions Engineer</p><p className="mt-2 flex items-center gap-1 text-xs text-[#667b71]"><MapPin className="size-3" /> San Francisco · 8 miles · Hybrid</p></div>
          <FileCheck2 className="size-5 shrink-0 text-[#4e7a63]" aria-hidden="true" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-[#173d2d]/10 pt-3 text-xs"><div><span className="block text-[#73867c]">Evidence</span><b>High</b></div><div><span className="block text-[#73867c]">Priority</span><b>Review</b></div><div><span className="block text-[#73867c]">Next</span><b>Employer site</b></div></div>
        <p className="mt-3 text-[11px] leading-4 text-[#667b71]">Nearby roles in the processed official-source portfolio. Public demo data is synthetic.</p>
      </div>
    </div>
  );
}

function RoleSignal({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-xl bg-[#edf1e8] px-3 py-2 text-xs"><span>{label}</span><b>{value}</b></div>;
}
