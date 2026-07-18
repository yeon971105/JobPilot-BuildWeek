import Link from "next/link";
import { ArrowRight, Check, Equal, Sparkles } from "lucide-react";
import { CALIBRATION_DISCLOSURE } from "@/lib/demo-contract";

const proof = ["Evidence-backed", "Deterministic scoring", "Required vs. preferred", "No hiring-probability claim"];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf7ed] text-[#173d2d]">
      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-7 sm:pb-24">
        <nav className="flex items-center justify-between" aria-label="Primary navigation">
          <Link href="/" className="font-serif text-2xl font-semibold">JobPilot</Link>
          <div className="flex items-center gap-5 text-sm font-semibold"><Link href="/demo/trust">Trust Lab</Link><Link href="/about/build-week" className="hidden sm:inline">Build Week</Link></div>
        </nav>
        <div className="mt-14 grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
          <div>
            <p className="eyebrow"><Sparkles className="size-4" /> Local-first, evidence-first AI</p>
            <h1 className="mt-6 max-w-3xl font-serif text-6xl leading-[.94] tracking-[-.045em] text-[#123426] sm:text-7xl lg:text-[5.5rem]">Know why a job fits.</h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[#4b6559]">JobPilot turns job descriptions into evidence-backed career decisions. See required and preferred qualifications, relevant experience, matched evidence, truthful gaps, practical constraints, and the exact mathematics behind every Fit Score.</p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#62796f]">Gemma 4 12B is the primary local semantic model. Versioned deterministic code calculates every point. GPT-5.6 is optional and reserved for bounded strategy and critique.</p>
            <div className="mt-5 flex flex-wrap gap-2"><span className="pill">Local Gemma — Primary</span><span className="pill">Deterministic Score</span><span className="pill">Optional GPT Heavy Reasoning</span></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/demo" className="button-primary">Try the Demo <ArrowRight className="size-4" /></Link>
              <Link href="/demo/trust" className="button-secondary">See How the Score Works</Link>
            </div>
            <p className="mt-5 text-sm text-[#667b71]">No login, real resume, private data, or application submission.</p>
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
    <div aria-label="Illustrative JobPilot workspace showing a 100-point example score connected to candidate evidence" role="img" className="relative min-h-[530px] rounded-[2.25rem] border border-white/80 bg-[#e9efe5] p-5 shadow-[0_35px_80px_rgba(37,67,52,.18)] sm:p-8">
      <div className="absolute -right-12 -top-12 size-48 rounded-full bg-[#d4c28e]/30 blur-3xl" />
      <div className="paper-card relative max-w-[72%] rotate-[-2deg]">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#779080]">Synthetic profile</p>
        <h2 className="mt-2 font-serif text-2xl">Demo Candidate A</h2>
        <p className="mt-1 text-sm text-[#61776c]">Data & applied AI solutions engineer</p>
        <div className="mt-5 space-y-3"><CapabilityBar label="Python systems" value="92%" /><CapabilityBar label="Applied AI" value="84%" /><CapabilityBar label="Customer delivery" value="88%" /></div>
      </div>
      <div className="absolute right-5 top-36 grid size-44 place-items-center rounded-full border-[14px] border-[#b89a56] bg-[#173d2d] text-center text-[#fffaf0] shadow-xl sm:right-9">
        <div><span className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#d9c992]">Illustrative</span><strong className="font-serif text-6xl">100</strong><span className="block text-xs">visible points</span></div>
      </div>
      <div className="absolute bottom-6 left-8 right-8 rounded-2xl border border-[#173d2d]/10 bg-[#fffaf0]/95 p-5 shadow-lg sm:left-20">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#a1742d]"><Equal className="size-4" /> Score receipt</p>
        <div className="mt-3 grid grid-cols-3 gap-3 text-sm"><div><span className="block text-[#73867c]">Core</span><b>88.00</b></div><div><span className="block text-[#73867c]">Preferred</span><b>9.00</b></div><div><span className="block text-[#73867c]">Nice</span><b>3.00</b></div></div>
        <p className="mt-3 border-t border-[#173d2d]/10 pt-3 text-xs text-[#667b71]">Illustrative artwork — not the live result for the demo profile.</p>
      </div>
    </div>
  );
}

function CapabilityBar({ label, value }: { label: string; value: string }) {
  return <div><div className="flex justify-between text-xs font-semibold"><span>{label}</span><span>{value}</span></div><div className="mt-1 h-1.5 rounded-full bg-[#dbe4dc]"><div className="h-full rounded-full bg-[#4e7a63]" style={{ width: value }} /></div></div>;
}
