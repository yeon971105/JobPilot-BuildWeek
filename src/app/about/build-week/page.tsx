import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";

const timeline = [
  ["False work-mode mismatch", "Separated practical work-mode compatibility from technical evidence and added regression cases."],
  ["Empty skill evidence", "Traced unsupported empty evidence, repaired grounding, and validated every cited ID."],
  ["Title-only role summary", "Reproduced the shallow summary and rebuilt it from responsibilities and qualifications."],
  ["Preferred-weight cancellation defect", "Proved the cancellation mathematically and restored bounded Preferred contribution."],
  ["Incomplete 100-point allocation defect", "Reconciled every micro-point and added total-allocation properties."],
  ["Local Gemma runtime timeout", "Isolated the loopback timeout path, bounded it, and certified a real gemma4:12b canary."],
  ["Missing Tailwind/PostCSS pipeline", "Reproduced broken production CSS, repaired the pipeline, and bound it to a bundle hash."],
  ["Dense audit-report Job Detail", "Measured the overload, compressed the decision view, and preserved proof through progressive disclosure."],
  ["Provider-provenance ambiguity", "Separated prepared, live-local, deterministic, and optional-heavy labels."],
  ["Private Resume network boundary", "Implemented real local parsing and verified zero external resume requests and zero raw-resume artifacts."],
] as const;

export default function Page() {
  return <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]"><DemoHeader /><main className="mx-auto max-w-6xl px-5 py-12"><p className="eyebrow">OpenAI Build Week · Apps for Your Life</p><h1 className="mt-4 max-w-5xl font-serif text-6xl leading-tight">Codex helped turn application fatigue into a reproducible product.</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-[#587064]">Codex did not only generate the interface. It helped trace real product failures, prove scoring defects mathematically, repair the CSS build pipeline, turn failures into regression tests, and package a reproducible release.</p><section className="mt-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Observed development evidence</p><h2 className="mt-2 font-serif text-4xl">Defect-to-validation timeline</h2></div><Link href="/demo/trust" className="button-secondary">Inspect Trust Lab</Link></div><div className="mt-6 space-y-4">{timeline.map(([defect, repair], index) => <article key={defect} className="paper-card grid gap-5 lg:grid-cols-[60px_240px_1fr]"><span className="grid size-12 place-items-center rounded-full bg-[#173d2d] font-mono text-sm text-[#fffaf0]">{String(index + 1).padStart(2, "0")}</span><div><p className="metric-label">Observed defect</p><h3 className="mt-2 font-serif text-2xl">{defect}</h3></div><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a1742d]">REPRODUCED → PROVED → REPAIRED → REGRESSION TEST → USER VALIDATION</p><p className="mt-3 leading-7 text-[#587064]">{repair}</p></div></article>)}</div></section><section className="mt-10 grid gap-5 md:grid-cols-3"><Proof title="Gemma remains primary" body="Gemma 4 12B owns primary semantic analysis; private resume analysis stays local." /><Proof title="Code owns every score" body="Deterministic AI Fit V2.2 allocates all 100 points and produces the independently verifiable receipt." /><Proof title="GPT-5.6 is prepared" body="Strategy and critique were prepared in the verified Codex session from frozen synthetic evidence with zero OpenAI API requests." /></section><div className="mt-9 flex flex-wrap gap-3"><Link href="/" className="button-primary">See the application-fatigue story <ArrowRight className="size-4" /></Link><Link href="/demo/jobs" className="button-secondary">Explore nearby roles</Link></div></main></div>;
}

function Proof({ title, body }: { title: string; body: string }) { return <article className="paper-card"><CheckCircle2 className="size-5 text-[#a1742d]" /><h2 className="mt-4 font-serif text-2xl">{title}</h2><p className="mt-3 text-sm leading-7 text-[#587064]">{body}</p></article>; }
