import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Database, FileKey2, MapPinned, ShieldCheck } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import snapshot from "../../../../build-week/bw8/production-coverage-snapshot.json";

export const metadata: Metadata = {
  title: "Production Coverage Proof | JobPilot",
  description: "A reproducible, public-safe aggregate snapshot of JobPilot's larger production acquisition system.",
};

const freshnessLabels: Record<string, string> = {
  WITHIN_24_HOURS: "Seen within 24 hours",
  ONE_TO_THREE_DAYS: "Seen 1–3 days ago",
  FOUR_TO_SEVEN_DAYS: "Seen 4–7 days ago",
  EIGHT_TO_FOURTEEN_DAYS: "Seen 8–14 days ago",
  FIFTEEN_TO_THIRTY_DAYS: "Seen 15–30 days ago",
  OVER_THIRTY_DAYS: "Seen over 30 days ago",
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
            <p className="eyebrow"><Database className="size-4" /> Production reality, without private records</p>
            <h1 className="mt-4 max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">A larger acquisition system stands behind the synthetic judge flow.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#587064]">{snapshot.disclosure}</p>
          </div>
          <aside className="rounded-3xl border border-[#315c49]/15 bg-[#e8efe6] p-6">
            <p className="metric-label">Claim boundary</p>
            <p className="mt-3 text-sm leading-7 text-[#486458]">{snapshot.claimBoundary}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="size-5 text-[#a1742d]" /> Reproduced in a read-only transaction</div>
          </aside>
        </section>

        <section aria-labelledby="coverage-scale-title" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Current aggregate snapshot</p><h2 id="coverage-scale-title" className="mt-2 font-serif text-4xl">Processed catalog coverage</h2></div><p className="text-sm text-[#667b71]">As of {formatTimestamp(snapshot.generatedAt)} UTC</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Metric label="Active catalog jobs" value={metrics.activeJobs.value} detail="Current ingestion status: ACTIVE" />
            <Metric label="Verified California scope" value={metrics.regionalCounts.californiaVerified.value} detail={metrics.regionalCounts.californiaVerified.label} />
            <Metric label="Bay Area memberships" value={metrics.regionalCounts.bayArea.value} detail={metrics.regionalCounts.bayArea.label} />
            <Metric label="Los Angeles memberships" value={metrics.regionalCounts.losAngeles.value} detail={metrics.regionalCounts.losAngeles.label} />
            <Metric label="Active source endpoints" value={metrics.activeSources.value} detail={`${formatNumber(metrics.completeSources.value)} latest complete snapshots`} />
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="paper-card">
            <div className="flex items-start justify-between gap-4"><div><p className="eyebrow"><FileKey2 className="size-4" /> Original application links</p><h2 className="mt-3 font-serif text-3xl">{metrics.originalApplicationLinkCoverage.percent}% recorded</h2></div><span className="pill">{formatNumber(metrics.originalApplicationLinkCoverage.count)} / {formatNumber(metrics.originalApplicationLinkCoverage.total)}</span></div>
            <p className="mt-4 text-sm leading-7 text-[#587064]">{metrics.originalApplicationLinkCoverage.definition}</p>
          </article>
          <article className="paper-card">
            <div className="flex items-start justify-between gap-4"><div><p className="eyebrow"><ShieldCheck className="size-4" /> Validated destinations</p><h2 className="mt-3 font-serif text-3xl">{metrics.validatedApplicationDestinations.percent}% apply-ready</h2></div><span className="pill">{formatNumber(metrics.validatedApplicationDestinations.count)} verified</span></div>
            <p className="mt-4 text-sm leading-7 text-[#587064]">{metrics.validatedApplicationDestinations.definition} Recorded and validated are deliberately reported as different claims.</p>
          </article>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <article className="paper-card">
            <div className="flex items-center justify-between gap-4"><div><p className="eyebrow"><Clock3 className="size-4" /> Catalog freshness</p><h2 className="mt-3 font-serif text-3xl">Last-seen distribution</h2></div><span className="text-right text-xs leading-5 text-[#667b71]">Last successful refresh<br /><b>{formatTimestamp(metrics.lastSuccessfulRefresh.value)}</b></span></div>
            <div className="mt-6 space-y-4">{metrics.freshnessDistribution.map((item) => <DistributionRow key={item.bucket} label={freshnessLabels[item.bucket] ?? item.bucket} count={item.count} percent={item.percent} />)}</div>
          </article>
          <article className="paper-card">
            <p className="eyebrow"><MapPinned className="size-4" /> Work mode</p>
            <h2 className="mt-3 font-serif text-3xl">Visible catalog mix</h2>
            <div className="mt-6 space-y-4">{metrics.workModeDistribution.map((item) => <DistributionRow key={item.workMode} label={item.workMode} count={item.count} percent={item.percent} />)}</div>
            <p className="mt-6 rounded-xl bg-[#fff4d8] p-4 text-sm leading-6">Work mode is a practical decision factor. It never changes the technical Fit Score.</p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl bg-[#173d2d] p-6 text-[#fffaf0] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#d7c68d]">Reproduce the proof</p><h2 className="mt-3 font-serif text-3xl">Every displayed number is query-bound.</h2><p className="mt-4 text-sm leading-7 text-[#dce8df]">The source schema, migration manifest, aggregate queries, query output, and final snapshot are SHA-256 bound. The command opens an explicit read-only database transaction and exports no rows.</p></div>
            <dl className="min-w-0 space-y-3 text-xs"><Hash label="Snapshot" value={snapshot.snapshotOutputHash} /><Hash label="Input" value={snapshot.reproduction.inputHash} /><Hash label="Query output" value={snapshot.reproduction.queryOutputHash} /></dl>
          </div>
          <code className="mt-7 block overflow-x-auto rounded-xl bg-black/20 p-4 text-xs text-[#eff5ef]">{snapshot.reproduction.command}</code>
        </section>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-[#173d2d]/10 bg-white/55 p-6"><div><p className="font-serif text-2xl">What should judges inspect next?</p><p className="mt-2 text-sm text-[#587064]">See how JobPilot turns visible evidence into three roles worth reviewing today.</p></div><div className="flex flex-wrap gap-3"><Link href="/demo/shortlist" className="button-primary">See Today&apos;s Shortlist <ArrowRight className="size-4" /></Link><Link href="/demo/trust" className="button-secondary">Open Trust Lab</Link></div></section>
      </main>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <article className="rounded-2xl border border-[#173d2d]/10 bg-[#fffdf7] p-5"><p className="metric-label">{label}</p><p className="mt-3 font-serif text-4xl tracking-tight">{formatNumber(value)}</p><p className="mt-2 text-xs leading-5 text-[#667b71]">{detail}</p></article>;
}

function DistributionRow({ label, count, percent }: { label: string; count: number; percent: number }) {
  return <div><div className="flex items-end justify-between gap-3 text-sm"><span className="font-semibold">{label}</span><span className="text-xs text-[#667b71]">{formatNumber(count)} · {percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e6e0d3]"><div className="h-full rounded-full bg-[#4e7a63]" style={{ width: `${Math.max(percent, count ? 0.4 : 0)}%` }} /></div></div>;
}

function Hash({ label, value }: { label: string; value: string }) {
  return <div className="grid min-w-0 gap-1 sm:grid-cols-[90px_1fr]"><dt className="font-bold text-[#d7c68d]">{label}</dt><dd className="min-w-0 break-all font-mono text-[#e6efe8]">{value}</dd></div>;
}
