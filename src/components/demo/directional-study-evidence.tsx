import aggregate from "../../../build-week/bw13/authentic-study-aggregate.json";

const traditional = aggregate.conditions.traditionalPosting;
const jobPilot = aggregate.conditions.jobPilot;

export function DirectionalStudyEvidence({ compact = false }: { compact?: boolean }) {
  return (
    <section id="directional-usability-study" aria-labelledby="directional-study-heading" className={`${compact ? "mt-10" : "mt-12"} rounded-3xl border border-[#173d2d]/10 bg-[#fffdf7] p-6 shadow-[0_18px_50px_rgba(39,61,49,.08)] sm:p-8`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Moderated directional usability study, n=5</p>
          <h2 id="directional-study-heading" className="mt-3 font-serif text-4xl leading-tight">Directional usability study</h2>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-[#587064]">Five participants compared a traditional job posting with JobPilot.</p>
        </div>
        <span className="pill">Minimum sample achieved</span>
      </div>

      <div data-study-metric-group="aggregate-only" className="mt-7 grid gap-4 lg:grid-cols-3">
        <StudyComparison
          label="Median task time"
          traditional={`${traditional.medianTaskTimeSeconds} sec`}
          jobPilot={`${jobPilot.medianTaskTimeSeconds} sec`}
          traditionalWidth="100%"
          jobPilotWidth={`${Math.round(jobPilot.medianTaskTimeSeconds / traditional.medianTaskTimeSeconds * 100)}%`}
        />
        <StudyComparison
          label="Factual accuracy"
          traditional={`${traditional.factualAccuracy.percent}%`}
          jobPilot={`${jobPilot.factualAccuracy.percent}%`}
          traditionalWidth={`${traditional.factualAccuracy.percent}%`}
          jobPilotWidth={`${jobPilot.factualAccuracy.percent}%`}
        />
        <StudyComparison
          label="Self-reported clarity"
          traditional={`${traditional.meanClarityOutOf7} / 7`}
          jobPilot={`${jobPilot.meanClarityOutOf7} / 7`}
          traditionalWidth={`${Math.round(traditional.meanClarityOutOf7 / 7 * 100)}%`}
          jobPilotWidth={`${Math.round(jobPilot.meanClarityOutOf7 / 7 * 100)}%`}
        />
      </div>

      <p data-limitation-adjacent="true" className="mt-5 rounded-2xl bg-[#fff4d8] p-4 text-base font-semibold leading-7 text-[#5e4a25]">Small directional study, n=5. All participants used the traditional condition first, so results may include an order effect.</p>
      <p className="mt-4 text-base leading-7 text-[#587064]">Confidence: <b>3.8 → 6.0 out of 7</b>. Decision alignment: <b>40% → 100%</b>. These are aggregate usability observations, not hiring-outcome evidence.</p>

      <details className="mt-5 rounded-2xl border border-[#173d2d]/10 bg-[#edf1e8] p-5">
        <summary className="min-h-11 text-base font-bold">View methodology</summary>
        <div className="mt-4 max-w-[68ch] space-y-3 text-base leading-7 text-[#587064]">
          <p>Participants reviewed two synthetic roles: Analytics Operations Engineer and Data Enablement Engineer. Different roles were used between conditions to prevent same-role carryover.</p>
          <p>Four factual questions covered required experience, preferred experience, work arrangement, and the weakest-supported qualification. Apply / Review Further / Skip was analyzed separately as decision alignment. Confidence and clarity used seven-point self-reported scales.</p>
          <p>Collection was anonymous and browser-local under <code>{aggregate.protocolVersion}</code>. It collected no PII, and participant-level rows are not public.</p>
          <p><b>Limitation:</b> {aggregate.limitation}</p>
        </div>
      </details>
    </section>
  );
}

function StudyComparison({ label, traditional, jobPilot, traditionalWidth, jobPilotWidth }: { label: string; traditional: string; jobPilot: string; traditionalWidth: string; jobPilotWidth: string }) {
  return (
    <article className="rounded-2xl border border-[#173d2d]/10 bg-[#fbf7ed] p-5">
      <h3 className="metric-label">{label}</h3>
      <dl className="mt-5 space-y-5">
        <MetricRow label="Traditional" value={traditional} width={traditionalWidth} muted />
        <MetricRow label="JobPilot" value={jobPilot} width={jobPilotWidth} />
      </dl>
    </article>
  );
}

function MetricRow({ label, value, width, muted = false }: { label: string; value: string; width: string; muted?: boolean }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3"><dt className="text-sm font-bold text-[#587064]">{label}</dt><dd className="font-serif text-3xl">{value}</dd></div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#dfe6dc]" aria-hidden="true"><div className={`h-full rounded-full ${muted ? "bg-[#87a48e]" : "bg-[#a1742d]"}`} style={{ width }} /></div>
    </div>
  );
}
