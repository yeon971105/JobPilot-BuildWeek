import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Database, FileKey2, MapPinned, ShieldCheck } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import snapshot from "../../../../build-week/bw9/frozen-coverage-snapshot.json";

export const metadata: Metadata = {
  title: "Frozen Production Coverage | JobPilot",
  description: "One immutable, public-safe aggregate snapshot of JobPilot's processed acquisition portfolio.",
};

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatTimestamp = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));

export default function Page() {
  const metrics = snapshot.metrics;
  return (
    <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]">
      <DemoHeader />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <section className="grid gap-8 lg:grid-cols-[1.12fr_.88fr] lg:items-end">
          <div>
            <p className="eyebrow"><Database className="size-4" /> Frozen production reality, without private records</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">One snapshot. Four facts. No live-count drift.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#587064]">{snapshot.disclosure}</p>
          </div>
          <aside className="rounded-3xl border border-[#315c49]/15 bg-[#e8efe6] p-6">
            <p className="metric-label">Frozen claim boundary</p>
            <p className="mt-3 text-sm leading-7 text-[#486458]">{snapshot.countingPopulation}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="size-5 text-[#a1742d]" /> {snapshot.status.replaceAll("_", " ")}</div>
          </aside>
        </section>

        <section aria-labelledby="coverage-scale-title" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Approval snapshot</p><h2 id="coverage-scale-title" className="mt-2 font-serif text-4xl">Processed catalog at a glance</h2></div><p className="text-sm text-[#667b71]">Frozen {formatTimestamp(snapshot.generatedAt)} UTC</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Active catalog jobs" value={metrics.activeCanonicalJobs.value} detail="Unique active Job IDs" />
            <Metric label="California jobs" value={metrics.californiaUniqueJobs.value} detail="Unique affirmative-scope jobs" />
            <Metric label="Active official-source endpoints" value={metrics.activeOfficialSourceEndpoints.value} detail={`${formatNumber(metrics.latestCompleteSnapshots.value)} latest complete snapshots`} />
            <Metric label="Last successful refresh" value={formatTimestamp(metrics.lastSuccessfulRefresh.value)} detail="UTC · frozen, not live" icon={<Clock3 className="size-4" />} />
          </div>
        </section>

        <section aria-label="Coverage evidence disclosures" className="mt-8 grid gap-4">
          <details className="paper-card">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 font-serif text-2xl"><MapPinned className="size-5 text-[#a1742d]" /> Regional membership detail</summary>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#587064]">These are distinct active-job memberships in exact market contracts. A job may belong to more than one market, so memberships are not added into the unique catalog total.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2"><Metric label="San Francisco Bay Area" value={metrics.bayAreaMemberships.value} detail={metrics.bayAreaMemberships.marketKey} /><Metric label="Los Angeles County" value={metrics.losAngelesCountyMemberships.value} detail={metrics.losAngelesCountyMemberships.marketKey} /></div>
          </details>

          <details className="paper-card">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 font-serif text-2xl"><ShieldCheck className="size-5 text-[#a1742d]" /> Recorded, reachable, and verified destinations</summary>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#587064]">These are progressive evidence claims, not interchangeable labels. A recorded posting is not automatically reachable, and a reachable URL is not automatically a verified application destination.</p>
            <div className="mt-5 grid gap-3">
              <EvidenceRow label="Original posting recorded" count={metrics.originalPostingRecorded.count} total={metrics.originalPostingRecorded.total} percent={metrics.originalPostingRecorded.percent} state={metrics.originalPostingRecorded.state} />
              <EvidenceRow label="URL reachable" count={metrics.urlReachable.count} total={metrics.urlReachable.total} percent={metrics.urlReachable.percent} state={metrics.urlReachable.state} />
              <EvidenceRow label="Apply destination verified" count={metrics.applyDestinationVerified.count} total={metrics.applyDestinationVerified.total} percent={metrics.applyDestinationVerified.percent} state={metrics.applyDestinationVerified.state} />
            </div>
            <p className="mt-5 rounded-xl bg-[#fff4d8] p-4 text-sm leading-6 text-[#6f6248]">The smaller verified share reflects a stricter evidence gate across a much larger later catalog. It is not presented as a market-coverage percentage or as a failure of recorded links.</p>
          </details>

          <details className="paper-card">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 font-serif text-2xl"><FileKey2 className="size-5 text-[#a1742d]" /> Counting methodology, lineage, and limitations</summary>
            <div className="mt-4 grid gap-5 text-sm leading-7 text-[#587064] lg:grid-cols-2">
              <div><h3 className="font-bold text-[#173d2d]">Different counting populations</h3><p className="mt-2">JP-41 certified a bounded 2,808-record private-shadow generation. This snapshot counts the later active Job catalog after subsequent acquisition and refresh generations. They are not the same population.</p></div>
              <div><h3 className="font-bold text-[#173d2d]">No double counting</h3><p className="mt-2">The active query returned {formatNumber(snapshot.integrity.activeCatalogRows)} rows and {formatNumber(snapshot.integrity.distinctActiveJobIds)} distinct IDs. Duplicate counting: {snapshot.integrity.duplicateCounting}.</p></div>
              <div><h3 className="font-bold text-[#173d2d]">Privacy</h3><p className="mt-2">Only aggregates, timestamps, contract metadata, and hashes leave the read-only transaction. No job descriptions, URLs, candidate records, credentials, or source payloads are exported.</p></div>
              <div><h3 className="font-bold text-[#173d2d]">Limitations</h3><p className="mt-2">The snapshot describes a processed source portfolio at one read version. It does not claim complete market coverage, hiring outcomes, or current live availability after the frozen timestamp.</p></div>
            </div>
            <dl className="mt-6 min-w-0 rounded-2xl bg-[#173d2d] p-5 text-xs text-[#fffaf0]"><Hash label="Snapshot" value={snapshot.snapshotOutputHash} /><Hash label="Database" value={snapshot.reproduction.databaseFingerprint} /><Hash label="Query output" value={snapshot.reproduction.queryOutputHash} /></dl>
            <code className="mt-4 block overflow-x-auto rounded-xl bg-[#edf1e8] p-4 text-xs">{snapshot.reproduction.command}</code>
          </details>
        </section>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-[#173d2d]/10 bg-white/55 p-6"><div><p className="font-serif text-2xl">What should judges inspect next?</p><p className="mt-2 text-sm text-[#587064]">See how JobPilot turns visible evidence into three roles worth reviewing today.</p></div><div className="flex flex-wrap gap-3"><Link href="/demo/shortlist" className="button-primary">See Today&apos;s Shortlist <ArrowRight className="size-4" /></Link><Link href="/demo/trust" className="button-secondary">Open Trust Lab</Link></div></section>
      </main>
    </div>
  );
}

function Metric({ label, value, detail, icon }: { label: string; value: number | string; detail: string; icon?: React.ReactNode }) {
  return <article className="rounded-2xl border border-[#173d2d]/10 bg-[#fffdf7] p-5"><p className="metric-label flex items-center gap-2">{icon}{label}</p><p className={`mt-3 font-serif tracking-tight ${typeof value === "number" ? "text-4xl" : "text-2xl leading-8"}`}>{typeof value === "number" ? formatNumber(value) : value}</p><p className="mt-2 text-xs leading-5 text-[#667b71]">{detail}</p></article>;
}

function EvidenceRow({ label, count, total, percent, state }: { label: string; count: number; total: number; percent: number; state: string }) {
  return <div className="grid gap-2 rounded-2xl bg-[#edf1e8] p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-bold">{label}</p><p className="mt-1 break-words font-mono text-[11px] text-[#667b71]">{state}</p></div><p className="font-serif text-2xl">{formatNumber(count)} <span className="font-sans text-xs text-[#667b71]">/ {formatNumber(total)} · {percent}%</span></p></div>;
}

function Hash({ label, value }: { label: string; value: string }) {
  return <div className="grid min-w-0 gap-1 py-1 sm:grid-cols-[90px_1fr]"><dt className="font-bold text-[#d7c68d]">{label}</dt><dd className="min-w-0 break-all font-mono text-[#e6efe8]">{value}</dd></div>;
}
