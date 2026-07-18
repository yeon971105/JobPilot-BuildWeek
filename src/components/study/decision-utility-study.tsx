"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, Download, HardDrive, RefreshCcw, ShieldCheck } from "lucide-react";
import {
  BIGGEST_GAP_CHOICES,
  createDecisionStudySession,
  DECISION_STUDY_CONSENT_VERSION,
  DECISION_STUDY_MINIMUM_PARTICIPANTS,
  DECISION_STUDY_PREFERRED_PARTICIPANTS,
  DECISION_STUDY_STORAGE_KEY,
  parseDecisionStudySession,
  PREFERRED_EXPERIENCE_CHOICES,
  REQUIRED_EXPERIENCE_CHOICES,
  studySessionToCsv,
  WORK_MODE_CHOICES,
  type DecisionStudyAnswer,
  type DecisionStudySession,
  type StudyCondition,
} from "@/lib/decision-study";

export type DecisionStudyRole = {
  id: string;
  company: string;
  title: string;
  summary: string;
  requiredQualifications: string[];
  preferredQualifications: string[];
  workModes: string[];
  location: string;
  candidateEvidence: string[];
  jobPilot: { fitScore: number | null; evidenceQuality: number; applyPriority: string; strongestMatch: string; biggestGap: string; blockerCount: number };
};

const conditionLabels: Record<StudyCondition, string> = { RAW_POSTING: "Raw Posting", JOBPILOT: "JobPilot" };

export function DecisionUtilityStudy({ role }: { role: DecisionStudyRole }) {
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<DecisionStudySession | null>(null);
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(parseDecisionStudySession(window.localStorage.getItem(DECISION_STUDY_STORAGE_KEY)));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (session) window.localStorage.setItem(DECISION_STUDY_STORAGE_KEY, JSON.stringify(session));
  }, [session]);
  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!hydrated) return <StudyShell><p className="py-20 text-center text-sm text-[#587064]">Preparing the local-only study…</p></StudyShell>;
  if (!session) return <ConsentScreen onConsent={() => setSession(createDecisionStudySession())} />;
  const condition = session.conditionOrder[session.currentIndex];
  if (!condition) return <StudyComplete session={session} onReset={() => reset(setSession)} />;
  const answer = session.answers[condition];
  const elapsed = Math.max(0, Math.floor((tick - Date.parse(session.conditionStartedAt)) / 1000));
  const complete = Boolean(answer.requiredExperienceAnswer && answer.preferredExperienceAnswer && answer.workModeAnswer && answer.biggestGapAnswer && answer.decision && answer.confidence && answer.transparency);
  const update = (patch: Partial<DecisionStudyAnswer>) => setSession((current) => current ? { ...current, answers: { ...current.answers, [condition]: { ...current.answers[condition], ...patch } } } : current);
  const finish = () => {
    if (!complete) return;
    const completedAt = new Date().toISOString();
    setSession((current) => current ? {
      ...current,
      currentIndex: current.currentIndex + 1,
      conditionStartedAt: completedAt,
      answers: { ...current.answers, [condition]: { ...current.answers[condition], taskSeconds: elapsed, completed: true, completedAt } },
    } : current);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <StudyShell>
    <section className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="eyebrow">Decision Utility Study · Task {session.currentIndex + 1} of 2</p><h1 className="mt-3 font-serif text-5xl">{conditionLabels[condition]} condition</h1><p className="mt-4 max-w-3xl text-[#587064]">Use only the frozen fictional posting and candidate. Identify required and preferred experience, work mode, the biggest gap, and one Apply / Review / Skip decision.</p></div><div className="flex flex-wrap items-center gap-3"><span className="pill"><Clock3 className="size-4" /> {elapsed}s</span><span className="pill">ID {session.participantId}</span></div></section>
    <div className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
      <ConditionPanel condition={condition} role={role} />
      <section aria-labelledby="study-questions" className="paper-card"><h2 id="study-questions" className="font-serif text-3xl">Your decision</h2><p className="mt-2 text-sm text-[#667b71]">All fields are required. Responses autosave in this browser only.</p><div className="mt-6 space-y-5">
        <SelectQuestion label="What required experience does this role state?" value={answer.requiredExperienceAnswer} options={REQUIRED_EXPERIENCE_CHOICES} onChange={(requiredExperienceAnswer) => update({ requiredExperienceAnswer })} />
        <SelectQuestion label="What preferred experience does this role state?" value={answer.preferredExperienceAnswer} options={PREFERRED_EXPERIENCE_CHOICES} onChange={(preferredExperienceAnswer) => update({ preferredExperienceAnswer })} />
        <SelectQuestion label="What work mode does this role support?" value={answer.workModeAnswer} options={WORK_MODE_CHOICES} onChange={(workModeAnswer) => update({ workModeAnswer })} />
        <SelectQuestion label="What is the biggest gap for this candidate?" value={answer.biggestGapAnswer} options={BIGGEST_GAP_CHOICES} onChange={(biggestGapAnswer) => update({ biggestGapAnswer })} />
        <fieldset><legend className="text-sm font-bold">Decision</legend><div className="mt-2 grid grid-cols-3 gap-2">{(["APPLY", "REVIEW", "SKIP"] as const).map((decision) => <label key={decision} className={`choice-control justify-center rounded-xl border p-3 ${answer.decision === decision ? "border-[#315c49] bg-[#e8efe6]" : "border-[#173d2d]/10"}`}><input type="radio" name="study-decision" value={decision} checked={answer.decision === decision} onChange={() => update({ decision })} />{decision}</label>)}</div></fieldset>
        <Rating label="Decision confidence" value={answer.confidence} onChange={(confidence) => update({ confidence })} low="Low" high="High" />
        <Rating label="Information transparency" value={answer.transparency} onChange={(transparency) => update({ transparency })} low="Opaque" high="Clear" />
      </div><button type="button" disabled={!complete} onClick={finish} className="button-primary mt-7 w-full justify-center disabled:cursor-not-allowed disabled:opacity-45">Save locally and {session.currentIndex === 0 ? "continue" : "finish"}</button></section>
    </div>
    <LocalOnlyNotice />
  </StudyShell>;
}

function ConsentScreen({ onConsent }: { onConsent: () => void }) {
  return <StudyShell><section className="mx-auto max-w-3xl py-10"><p className="eyebrow"><ShieldCheck className="size-4" /> Consent before collection</p><h1 className="mt-4 font-serif text-5xl">Help evaluate the interface—not yourself.</h1><div className="paper-card mt-7 space-y-4 text-sm leading-7 text-[#587064]"><p>This is a voluntary usability study using one fictional job and one fictional candidate. You will complete a Raw Posting task and a JobPilot task in a random order. Each usually takes a few minutes.</p><p>The study records an anonymous random ID, condition order, answers, completion time, decision, confidence, and transparency rating. It does not ask for or permit your name, email, resume, demographic data, employment status, health data, employer credentials, or personal history.</p><p>Responses stay in this browser until you explicitly export a CSV or JSON file. JobPilot sends nothing over the network. You may exit or reset at any time. By choosing <b>I consent and begin</b>, you confirm that you understand this notice and voluntarily agree to provide the anonymous study responses to the study owner.</p><div className="rounded-xl bg-[#fff4d8] p-4 text-[#6f6248]"><b>Collection target:</b> minimum {DECISION_STUDY_MINIMUM_PARTICIPANTS} actual participants; preferred {DECISION_STUDY_PREFERRED_PARTICIPANTS}. No human results are currently bundled with this release.</div><p className="text-xs">Consent version: <code>{DECISION_STUDY_CONSENT_VERSION}</code></p></div><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={onConsent} className="button-primary">I consent and begin</button><Link href="/" className="button-secondary">No thanks</Link></div><LocalOnlyNotice /></section></StudyShell>;
}

function ConditionPanel({ condition, role }: { condition: StudyCondition; role: DecisionStudyRole }) {
  return <article className="rounded-3xl border border-[#173d2d]/10 bg-[#fffdf7] p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#a1742d]">Fictional role · {conditionLabels[condition]}</p><p className="mt-3 text-sm font-bold text-[#517061]">{role.company}</p><h2 className="mt-1 font-serif text-3xl">{role.title}</h2><p className="mt-2 text-sm text-[#667b71]">{role.location} · {role.workModes.join(" / ")}</p></div>{condition === "JOBPILOT" && <div className="grid size-24 place-items-center rounded-full border-[8px] border-[#87a48e] bg-[#edf3eb] text-center">{role.jobPilot.fitScore === null ? <span className="text-[10px] font-bold">NO NUMERIC<br />SCORE</span> : <span><strong className="block text-3xl leading-none">{role.jobPilot.fitScore}</strong><small className="font-bold">FIT</small></span>}</div>}</div>
    {condition === "RAW_POSTING" ? <div className="mt-6"><p className="leading-7 text-[#587064]">{role.summary}</p><QualificationList title="Required qualifications" items={role.requiredQualifications} /><QualificationList title="Preferred qualifications" items={role.preferredQualifications} /><QualificationList title="Fictional candidate evidence" items={role.candidateEvidence} /></div> : <div className="mt-6"><div className="grid gap-3 sm:grid-cols-2"><Signal label="Evidence Quality" value={`${role.jobPilot.evidenceQuality.toFixed(1)} / 100`} /><Signal label="Apply Priority" value={role.jobPilot.applyPriority.replaceAll("_", " ")} /><Signal label="Strongest match" value={role.jobPilot.strongestMatch} /><Signal label="Biggest gap" value={role.jobPilot.biggestGap} /></div><p className={`mt-4 rounded-xl p-4 text-sm font-bold ${role.jobPilot.blockerCount ? "bg-[#f8e6df] text-[#7b4037]" : "bg-[#edf4ea] text-[#315c49]"}`}>{role.jobPilot.blockerCount ? `${role.jobPilot.blockerCount} confirmed blocker` : "No confirmed blocker"}. Fit Score uses technical evidence only.</p><details className="mt-4 rounded-xl border border-[#173d2d]/10 p-4"><summary className="cursor-pointer font-bold">Inspect frozen source information</summary><QualificationList title="Required" items={role.requiredQualifications} /><QualificationList title="Preferred" items={role.preferredQualifications} /><QualificationList title="Fictional candidate evidence" items={role.candidateEvidence} /></details></div>}
  </article>;
}

function QualificationList({ title, items }: { title: string; items: string[] }) { return <div className="mt-6"><h3 className="font-serif text-xl">{title}</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-[#587064]">{items.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="text-[#a1742d]">•</span>{item}</li>)}</ul></div>; }
function Signal({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#edf1e8] p-4"><p className="metric-label">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>; }
function SelectQuestion({ label, value, options, onChange }: { label: string; value: string; options: ReadonlyArray<readonly [string, string]>; onChange: (value: string) => void }) { return <label className="block text-sm font-bold">{label}<select className="form-control font-normal" value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([optionValue, optionLabel]) => <option key={optionValue || "empty"} value={optionValue}>{optionLabel}</option>)}</select></label>; }
function Rating({ label, value, onChange, low, high }: { label: string; value: number; onChange: (value: number) => void; low: string; high: string }) { return <label className="block text-sm font-bold">{label}: {value} / 7<input className="mt-3 block w-full accent-[#315c49]" type="range" min={1} max={7} step={1} value={value} onChange={(event) => onChange(Number(event.target.value))} /><span className="mt-1 flex justify-between text-xs font-normal text-[#667b71]"><span>{low}</span><span>{high}</span></span></label>; }
function LocalOnlyNotice() { return <aside className="mt-6 flex items-start gap-3 rounded-2xl border border-[#315c49]/15 bg-[#e8efe6] p-5 text-sm leading-6"><HardDrive className="mt-0.5 size-5 shrink-0 text-[#a1742d]" /><p><b>Local-only storage.</b> The harness makes no network request and collects no name, email, resume, demographic, employment-status, or health information. Export is initiated by you and stays on this device.</p></aside>; }

function StudyComplete({ session, onReset }: { session: DecisionStudySession; onReset: () => void }) {
  return <StudyShell><section className="mx-auto max-w-3xl py-12 text-center"><CheckCircle2 className="mx-auto size-10 text-[#a1742d]" /><p className="eyebrow mt-5 justify-center">Local study session complete</p><h1 className="mt-3 font-serif text-5xl">Two decisions, ready to export.</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#587064]">Your anonymous responses remain in this browser. Export the CSV and give it to the study owner only if you consented to participate.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" className="button-primary" onClick={() => download(`jobpilot-study-${session.participantId}.csv`, studySessionToCsv(session), "text/csv")}><Download className="size-4" /> Export CSV</button><button type="button" className="button-secondary" onClick={() => download(`jobpilot-study-${session.participantId}.json`, JSON.stringify(session, null, 2), "application/json")}><Download className="size-4" /> Export JSON</button><button type="button" className="button-secondary" onClick={onReset}><RefreshCcw className="size-4" /> Delete and reset</button></div><p className="mt-5 text-sm font-semibold">Owner analysis command: <code>npm run study:analyze -- &lt;combined.csv&gt;</code></p><LocalOnlyNotice /></section></StudyShell>;
}

function StudyShell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]"><header className="border-b border-[#173d2d]/10"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4"><span className="font-serif text-xl font-semibold">JobPilot Research</span><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" /> Exit study</Link></div></header><main className="mx-auto max-w-7xl px-5 py-10">{children}</main></div>; }
function download(name: string, content: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }
function reset(setSession: React.Dispatch<React.SetStateAction<DecisionStudySession | null>>) { window.localStorage.removeItem(DECISION_STUDY_STORAGE_KEY); setSession(null); window.scrollTo({ top: 0, behavior: "smooth" }); }
