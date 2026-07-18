import Link from "next/link";
import { ArrowRight, Check, FileCheck2, Link2, MapPin, Sparkles } from "lucide-react";
import { CALIBRATION_DISCLOSURE } from "@/lib/demo-contract";
import { SiteNavigation } from "@/components/demo/site-navigation";

const proof = ["Required vs. preferred", "Relevant experience", "Evidence behind every point", "Private local analysis"];

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
            <p className="eyebrow"><Sparkles className="size-4" /> Evidence-first career decisions</p>
            <h1 className="mt-6 max-w-3xl font-serif text-6xl leading-[.94] tracking-[-.045em] text-[#123426] sm:text-7xl lg:text-[5.5rem]">Know why a job fits.</h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[#4b6559]">JobPilot turns job descriptions and candidate evidence into a transparent career decision—without asking you to trust a black-box score.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/demo" className="button-primary">Try the Demo <ArrowRight className="size-4" /></Link>
              <Link href="/profile/resume" className="button-secondary">Use My Resume Privately</Link>
            </div>
            <Link href="/demo/trust" className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-[#315c49] underline decoration-[#b08337] underline-offset-4">See How the Score Works</Link>
          </div>
          <HeroArtwork />
        </div>
        <div className="mt-14 grid overflow-hidden rounded-2xl border border-[#173d2d]/10 bg-white/55 sm:grid-cols-2 lg:grid-cols-4">
          {proof.map((item) => <div key={item} className="flex items-center gap-2 border-b border-[#173d2d]/10 px-5 py-4 text-sm font-semibold last:border-0 sm:border-r lg:border-b-0"><Check className="size-4 text-[#b08337]" />{item}</div>)}
        </div>
      </section>
      <section className="border-t border-[#173d2d]/10 bg-[#f1eadb] px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          {[['Read the role', 'Requirements stay tied to the exact fictional source section and quote.'], ['Inspect every point', 'Capability budgets, match intervals, uncertainty, and transfers reconcile to 100.'], ['Act without overclaiming', 'Build a grounded strategy, save the role, and move it through a session-local tracker.']].map(([title, body], index) => <article key={title} className="paper-card"><span className="font-mono text-xs text-[#a1742d]">0{index + 1}</span><h2 className="mt-5 font-serif text-2xl">{title}</h2><p className="mt-3 leading-7 text-[#587064]">{body}</p></article>)}
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs text-[#6c7e75]">{CALIBRATION_DISCLOSURE}</p>
      </section>
    </main>
  );
}

function HeroArtwork() {
  return (
    <div data-testid="hero-illustration" aria-label="Illustrative JobPilot workspace showing a profile, role, evidence links, and concise score receipt" role="img" className="relative min-h-[570px] overflow-hidden rounded-[2.25rem] border border-white/80 bg-[#e9efe5] p-5 shadow-[0_35px_80px_rgba(37,67,52,.18)] sm:min-h-[620px] sm:p-8">
      <div className="absolute -right-12 -top-12 size-48 rounded-full bg-[#d4c28e]/30 blur-3xl" />
      <div className="paper-card relative max-w-[78%] rotate-[-2deg] sm:max-w-[72%]">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#779080]">Synthetic profile</p>
        <p className="mt-2 font-serif text-2xl">Demo Candidate A</p>
        <p className="mt-1 text-sm text-[#61776c]">Data & applied AI solutions engineer</p>
        <div className="mt-5 space-y-3"><CapabilityBar label="Python systems" value="92%" /><CapabilityBar label="Applied AI" value="84%" /><CapabilityBar label="Customer delivery" value="88%" /></div>
      </div>
      <div data-testid="hero-score-ring" className="absolute right-3 top-40 grid size-36 place-items-center rounded-full border-[12px] border-[#b89a56] bg-[#173d2d] text-center text-[#fffaf0] shadow-xl sm:right-9 sm:top-36 sm:size-44 sm:border-[14px]">
        <div><span className="block text-[11px] font-bold uppercase tracking-[.16em] text-[#d9c992]">Example Fit</span><strong className="font-sans text-5xl">78</strong><span className="block text-xs">of 100</span></div>
      </div>
      <div aria-hidden="true" className="absolute left-[24%] top-[305px] hidden h-20 w-[58%] rounded-[50%] border-t border-dashed border-[#9a844f]/60 sm:block" />
      <div className="absolute left-5 right-5 top-[318px] hidden grid-cols-3 gap-2 sm:grid">
        <EvidenceChip id="REQ-01" label="Python systems" />
        <EvidenceChip id="EVD-02" label="AI delivery" />
        <EvidenceChip id="EVD-05" label="Customer work" />
      </div>
      <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[#173d2d]/10 bg-[#fffaf0]/95 p-4 shadow-lg sm:bottom-7 sm:left-14 sm:right-8 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#a1742d]">Synthetic example role</p><p className="mt-1 font-serif text-lg leading-tight">Applied AI Solutions Engineer</p><p className="mt-2 flex items-center gap-1 text-xs text-[#667b71]"><MapPin className="size-3" /> San Francisco · Hybrid</p></div>
          <FileCheck2 className="size-5 shrink-0 text-[#4e7a63]" aria-hidden="true" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-[#173d2d]/10 pt-3 text-xs"><div><span className="block text-[#73867c]">Required</span><b>Strong</b></div><div><span className="block text-[#73867c]">Evidence</span><b>High</b></div><div><span className="block text-[#73867c]">Priority</span><b>Review</b></div></div>
        <p className="mt-3 text-[11px] leading-4 text-[#667b71]">Illustrative receipt — every point opens to evidence.</p>
      </div>
    </div>
  );
}

function EvidenceChip({ id, label }: { id: string; label: string }) {
  return <div className="relative rounded-xl border border-[#173d2d]/10 bg-[#fffdf7]/95 p-3 shadow-md"><p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[.12em] text-[#a1742d]"><Link2 className="size-3" />{id}</p><p className="mt-1 text-[11px] font-semibold leading-4">{label}</p></div>;
}

function CapabilityBar({ label, value }: { label: string; value: string }) {
  return <div><div className="flex justify-between text-xs font-semibold"><span>{label}</span><span>{value}</span></div><div className="mt-1 h-1.5 rounded-full bg-[#dbe4dc]"><div className="h-full rounded-full bg-[#4e7a63]" style={{ width: value }} /></div></div>;
}
