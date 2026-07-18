"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Download, HardDrive, RefreshCcw, ShieldCheck } from "lucide-react";
import {
  BIGGEST_GAP_CHOICES,
  createDecisionStudySession,
  DECISION_CHOICES,
  DECISION_STUDY_CONSENT_VERSION,
  DECISION_STUDY_PROTOCOL_VERSION,
  DECISION_STUDY_ROLES,
  DECISION_STUDY_STORAGE_KEY,
  parseDecisionStudySession,
  PREFERRED_EXPERIENCE_CHOICES,
  REQUIRED_EXPERIENCE_CHOICES,
  scoreStudyResponse,
  studySessionToCsv,
  WORK_MODE_CHOICES,
  type DecisionStudyResponse,
  type DecisionStudySession,
  type StudyMode,
  type StudyQuestionKey,
} from "@/lib/decision-study";

const questions: Array<{ key: StudyQuestionKey; label: string; options: ReadonlyArray<readonly [string, string]> }> = [
  { key: "requiredExperienceAnswer", label: "Which experience is required?", options: REQUIRED_EXPERIENCE_CHOICES },
  { key: "preferredExperienceAnswer", label: "Which experience is preferred but not mandatory?", options: PREFERRED_EXPERIENCE_CHOICES },
  { key: "workModeAnswer", label: "What work arrangement does the role offer?", options: WORK_MODE_CHOICES },
  { key: "weakestQualificationAnswer", label: "Which qualification has the weakest support?", options: BIGGEST_GAP_CHOICES },
  { key: "decision", label: "Would you Apply, Review Further, or Skip?", options: DECISION_CHOICES },
];

function modeFromLocation(): StudyMode {
  const mode = new URLSearchParams(window.location.search).get("mode")?.toUpperCase();
  return mode === "PREVIEW" || mode === "PILOT" ? mode : "FINAL";
}

export function DecisionUtilityStudy() {
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<StudyMode>("FINAL");
  const [preScreen, setPreScreen] = useState<0 | 1>(0);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [session, setSession] = useState<DecisionStudySession | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextMode = modeFromLocation();
      const saved = parseDecisionStudySession(window.localStorage.getItem(DECISION_STUDY_STORAGE_KEY));
      setMode(nextMode); setSession(saved?.phase === nextMode ? saved : null); setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (session) window.localStorage.setItem(DECISION_STUDY_STORAGE_KEY, JSON.stringify(session)); }, [session]);

  if (!hydrated) return <StudyShell><p className="py-20 text-center text-sm text-[#587064]">Preparing the local-only study…</p></StudyShell>;
  if (!session && preScreen === 0) return <Introduction mode={mode} onNext={() => setPreScreen(1)} />;
  if (!session) return <Consent mode={mode} confirmed={adultConfirmed} setConfirmed={setAdultConfirmed} onConsent={() => setSession(createDecisionStudySession({ phase: mode, authenticHumanConfirmation: mode !== "PREVIEW" && adultConfirmed }))} />;
  if (session.screen === 2) return <Primer mode={mode} onNext={() => patchSession(setSession, { screen: 3 })} />;
  if (session.screen === 3) return <Comprehension mode={mode} onPass={() => patchSession(setSession, { screen: 4, comprehensionPassed: true })} />;
  if (session.screen === 4 || session.screen === 12) {
    const index = session.screen === 4 ? 0 : 1;
    return <ConditionInstructions mode={mode} response={session.responses[index]} number={index + 1} onNext={() => patchSession(setSession, { screen: session.screen + 1, currentConditionIndex: index, conditionStartedAt: new Date().toISOString() })} />;
  }
  if ((session.screen >= 5 && session.screen <= 9) || (session.screen >= 13 && session.screen <= 17)) {
    const index = session.screen <= 9 ? 0 : 1;
    const questionIndex = session.screen <= 9 ? session.screen - 5 : session.screen - 13;
    return <QuestionScreen mode={mode} session={session} responseIndex={index} questionIndex={questionIndex} onSession={setSession} />;
  }
  if (session.screen === 10 || session.screen === 18) {
    const index = session.screen === 10 ? 0 : 1;
    return <RatingScreen mode={mode} session={session} responseIndex={index} onSession={setSession} />;
  }
  if (session.screen === 11) return <Transition mode={mode} onNext={() => patchSession(setSession, { screen: 12 })} />;
  return <Completion mode={mode} session={session} onReset={() => resetStudy(setSession, setPreScreen)} />;
}

function Introduction({ mode, onNext }: { mode: StudyMode; onNext: () => void }) {
  return <StudyShell mode={mode}><section className="mx-auto max-w-3xl py-8"><p className="eyebrow">Independent usability research</p><h1 className="mt-4 font-serif text-5xl leading-tight">Can JobPilot make a job decision easier?</h1><div className="paper-card mt-7 space-y-4 text-lg leading-8 text-[#587064]"><p>You will review two fictional roles.</p><p>For one role, you will use a traditional job posting and candidate profile.</p><p>For the other, you will use JobPilot.</p><p>We measure how quickly and accurately you can understand each role.</p><p className="font-bold text-[#173d2d]">This is a usability study, not a job application.</p></div><button type="button" onClick={onNext} className="button-primary mt-6">Continue</button><LocalOnly /></section></StudyShell>;
}

function Consent({ mode, confirmed, setConfirmed, onConsent }: { mode: StudyMode; confirmed: boolean; setConfirmed: (value: boolean) => void; onConsent: () => void }) {
  return <StudyShell mode={mode}><section className="mx-auto max-w-3xl py-8"><p className="eyebrow"><ShieldCheck className="size-4" /> Consent</p><h1 className="mt-4 font-serif text-5xl">Choose whether to take part.</h1><div className="paper-card mt-7 space-y-4 text-sm leading-7 text-[#587064]"><p>Participation is voluntary. The study stores an anonymous ID, assigned role order, answers, completion time, confidence, and clarity in this browser until you export or reset it.</p><p>It does not ask for your name, email, phone, resume, demographic data, employment status, health information, home address, or IP address. You may exit at any time.</p><p>By continuing, you consent to provide these anonymous usability responses to the study owner.</p><label className="choice-control w-full"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> I am an adult completing this session myself.</label><p className="text-xs">Protocol: <code>{DECISION_STUDY_PROTOCOL_VERSION}</code> · Consent: <code>{DECISION_STUDY_CONSENT_VERSION}</code></p></div><div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={!confirmed} onClick={onConsent} className="button-primary disabled:cursor-not-allowed disabled:opacity-45">I consent and continue</button><Link href="/" className="button-secondary">No thanks</Link></div><LocalOnly /></section></StudyShell>;
}

function Primer({ mode, onNext }: { mode: StudyMode; onNext: () => void }) {
  const terms = [["Required experience", "The applicant is expected to have this."], ["Preferred experience", "This would help, but it is not mandatory."], ["Work arrangement", "Remote, hybrid, onsite, or another stated work pattern."], ["Weakest-supported qualification", "The role requirement with the least evidence in the candidate profile."], ["Apply", "The available evidence supports applying."], ["Review Further", "More information or preparation is needed."], ["Skip", "The role currently appears to be a poor use of application time."]] as const;
  return <StudyShell mode={mode}><Progress step={3} label="Primer" /><section className="mx-auto max-w-4xl"><p className="eyebrow">Before you begin</p><h1 className="mt-4 font-serif text-5xl">A short guide to the terms</h1><div className="mt-7 grid gap-3 md:grid-cols-2">{terms.map(([term, definition]) => <article key={term} className="rounded-2xl border border-[#173d2d]/10 bg-[#fffdf7] p-5"><h2 className="font-serif text-xl">{term}</h2><p className="mt-2 text-sm leading-6 text-[#587064]">{definition}</p></article>)}</div><button type="button" onClick={onNext} className="button-primary mt-6">Check my understanding</button></section></StudyShell>;
}

function Comprehension({ mode, onPass }: { mode: StudyMode; onPass: () => void }) {
  const [required, setRequired] = useState(""); const [review, setReview] = useState(""); const [attempted, setAttempted] = useState(false);
  const correct = required === "EXPECTED" && review === "MORE_INFORMATION";
  return <StudyShell mode={mode}><Progress step={4} label="Comprehension" /><section className="mx-auto max-w-3xl"><p className="eyebrow">Understanding check</p><h1 className="mt-4 font-serif text-5xl">Two quick checks</h1><div className="paper-card mt-7 space-y-7"><AnswerGroup name="required-check" label="What does required experience mean?" value={required} onChange={setRequired} options={[["EXPECTED", "The applicant is expected to have it"], ["OPTIONAL", "It is optional"]]} /><AnswerGroup name="review-check" label="When should you choose Review Further?" value={review} onChange={setReview} options={[["MORE_INFORMATION", "More information or preparation is needed"], ["AUTOMATIC_APPLY", "An application should be sent automatically"]]} />{attempted && !correct && <p role="alert" className="rounded-xl bg-[#fff4d8] p-4 text-sm font-bold">Review the primer definitions and try again. Attempts are not counted as study performance.</p>}</div><button type="button" disabled={!required || !review} onClick={() => { setAttempted(true); if (correct) onPass(); }} className="button-primary mt-6 disabled:opacity-45">Continue</button></section></StudyShell>;
}

function ConditionInstructions({ mode, response, number, onNext }: { mode: StudyMode; response: DecisionStudyResponse; number: number; onNext: () => void }) {
  const role = DECISION_STUDY_ROLES[response.roleId];
  return <StudyShell mode={mode}><Progress step={number === 1 ? 5 : 9} label={`Role ${number} instructions`} /><section className="mx-auto max-w-4xl"><p className="eyebrow">Role {number} of 2 · {response.condition === "RAW_POSTING" ? "Traditional materials" : "JobPilot view"}</p><h1 className="mt-4 font-serif text-5xl">Review {role.title}</h1><div className="paper-card mt-7"><p className="text-lg leading-8 text-[#587064]">Use only the information shown on the next screens. Answer five questions, then rate your confidence and the clarity of the information.</p><p className="mt-4 font-bold">The timer runs in the background and is not displayed.</p></div><button type="button" onClick={onNext} className="button-primary mt-6">Begin this role</button></section></StudyShell>;
}

function QuestionScreen({ mode, session, responseIndex, questionIndex, onSession }: { mode: StudyMode; session: DecisionStudySession; responseIndex: number; questionIndex: number; onSession: React.Dispatch<React.SetStateAction<DecisionStudySession | null>> }) {
  const response = session.responses[responseIndex]!; const question = questions[questionIndex]!; const role = DECISION_STUDY_ROLES[response.roleId]; const value = response[question.key] as string;
  const setValue = (next: string) => updateResponse(onSession, responseIndex, { [question.key]: next } as Partial<DecisionStudyResponse>);
  return <StudyShell mode={mode}><Progress step={responseIndex === 0 ? 6 : 10} label={`Role ${responseIndex + 1} · Question ${questionIndex + 1} of 5`} /><div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]"><StudyMaterial role={role} condition={response.condition} /><section className="paper-card h-fit lg:sticky lg:top-6"><p className="eyebrow">Question {questionIndex + 1} of 5</p><h1 className="mt-4 font-serif text-4xl leading-tight">{question.label}</h1><AnswerGroup name={`question-${responseIndex}-${questionIndex}`} label="Choose one answer" value={value} onChange={setValue} options={question.options} hideLegend /><div className="mt-7 flex justify-between gap-3"><button type="button" onClick={() => patchSession(onSession, { screen: session.screen - 1 })} className="button-secondary">Back</button><button type="button" disabled={!value} onClick={() => patchSession(onSession, { screen: session.screen + 1 })} className="button-primary disabled:opacity-45">Next</button></div></section></div></StudyShell>;
}

function RatingScreen({ mode, session, responseIndex, onSession }: { mode: StudyMode; session: DecisionStudySession; responseIndex: number; onSession: React.Dispatch<React.SetStateAction<DecisionStudySession | null>> }) {
  const response = session.responses[responseIndex]!;
  function complete() {
    if (!response.confidence || !response.clarity) return;
    const now = new Date(); const taskSeconds = Math.max(1, Math.round((now.getTime() - Date.parse(session.conditionStartedAt)) / 1000));
    updateResponse(onSession, responseIndex, { taskSeconds, completed: true, completedAt: now.toISOString(), correctness: scoreStudyResponse(response) });
    patchSession(onSession, { screen: responseIndex === 0 ? 11 : 19, currentConditionIndex: responseIndex + 1 });
  }
  return <StudyShell mode={mode}><Progress step={responseIndex === 0 ? 7 : 11} label={`Role ${responseIndex + 1} · Final ratings`} /><section className="mx-auto max-w-3xl"><p className="eyebrow">Final ratings for this role</p><h1 className="mt-4 font-serif text-5xl">How did that decision feel?</h1><div className="paper-card mt-7 space-y-7"><Rating label="How confident are you in your decision?" value={response.confidence} onChange={(confidence) => updateResponse(onSession, responseIndex, { confidence })} low="Not confident" high="Very confident" /><Rating label="How clear was the information?" value={response.clarity} onChange={(clarity) => updateResponse(onSession, responseIndex, { clarity })} low="Unclear" high="Very clear" /></div><div className="mt-6 flex justify-between gap-3"><button type="button" onClick={() => patchSession(onSession, { screen: session.screen - 1 })} className="button-secondary">Back</button><button type="button" disabled={!response.confidence || !response.clarity} onClick={complete} className="button-primary disabled:opacity-45">{responseIndex === 0 ? "Finish role" : "Complete study"}</button></div></section></StudyShell>;
}

function Transition({ mode, onNext }: { mode: StudyMode; onNext: () => void }) {
  return <StudyShell mode={mode}><Progress step={8} label="Transition" /><section className="mx-auto max-w-3xl py-12 text-center"><CheckCircle2 className="mx-auto size-10 text-[#a1742d]" /><p className="eyebrow mt-5">First role complete</p><h1 className="mt-4 font-serif text-5xl">Take a breath before role two.</h1><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#587064]">The next role is different and uses a different presentation. Your earlier answers will not be shown.</p><button type="button" onClick={onNext} className="button-primary mt-7">Continue to role two</button></section></StudyShell>;
}

function Completion({ mode, session, onReset }: { mode: StudyMode; session: DecisionStudySession; onReset: () => void }) {
  return <StudyShell mode={mode}><section className="mx-auto max-w-5xl py-8"><CheckCircle2 className="size-10 text-[#a1742d]" /><p className="eyebrow mt-5">Session complete</p><h1 className="mt-3 font-serif text-5xl">Thank you for reviewing both roles.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[#587064]">Your anonymous responses remain in this browser until you export or reset them.</p>{mode === "PREVIEW" && <PreviewSummary session={session} />}<div className="mt-8 flex flex-wrap gap-3">{mode !== "PREVIEW" && <><button type="button" className="button-primary" onClick={() => download(`jobpilot-study-${session.participantId}.csv`, studySessionToCsv(session), "text/csv")}><Download className="size-4" /> Export {mode === "PILOT" ? "Pilot" : "Final"} CSV</button><button type="button" className="button-secondary" onClick={() => download(`jobpilot-study-${session.participantId}.json`, JSON.stringify(session, null, 2), "application/json")}><Download className="size-4" /> Export JSON</button></>}<button type="button" className="button-secondary" onClick={onReset}><RefreshCcw className="size-4" /> Reset</button>{mode === "PREVIEW" && <button type="button" className="button-primary" onClick={() => { window.localStorage.removeItem(DECISION_STUDY_STORAGE_KEY); window.location.href = "/study/decision-utility?mode=pilot"; }}>Start Pilot Mode</button>}</div><LocalOnly /></section></StudyShell>;
}

function PreviewSummary({ session }: { session: DecisionStudySession }) {
  return <section className="paper-card mt-8 min-w-0"><h2 className="font-serif text-3xl">Preview validation summary</h2><p className="mt-2 text-sm">Assignment: <b>{session.assignmentGroup}</b> · Preview data is excluded from participant evidence.</p><div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">{session.responses.map((response) => { const role = DECISION_STUDY_ROLES[response.roleId]; const correctness = scoreStudyResponse(response); const warnings = response.clarity <= 3 ? "Clarity warning: review these instructions before pilot." : "No clarity warning."; return <article key={response.roleId} className="min-w-0 rounded-2xl bg-[#edf1e8] p-5"><h3 className="break-words font-serif text-2xl">{role.title}</h3><p className="mt-1 text-xs font-bold">{response.condition} · {response.taskSeconds ?? 0} seconds</p><dl className="mt-4 min-w-0 space-y-2 text-sm">{questions.map((question) => <div key={question.key} className="min-w-0"><dt className="font-bold">{question.label}</dt><dd className="break-all sm:break-words">{String(response[question.key]) || "No answer"} · {correctness[question.key] ? "Correct" : "Incorrect"}</dd></div>)}</dl><p className="mt-4 text-sm">Confidence {response.confidence}/7 · Clarity {response.clarity}/7</p><p className="mt-2 text-xs font-bold">{warnings}</p></article>; })}</div></section>;
}

function StudyMaterial({ role, condition }: { role: (typeof DECISION_STUDY_ROLES)[keyof typeof DECISION_STUDY_ROLES]; condition: "RAW_POSTING" | "JOBPILOT" }) {
  return <article className="rounded-3xl border border-[#173d2d]/10 bg-[#fffdf7] p-5 sm:p-6"><p className="eyebrow">Fictional role · {condition === "RAW_POSTING" ? "Traditional posting" : "JobPilot"}</p><h2 className="mt-3 font-serif text-3xl">{role.title}</h2><p className="mt-1 font-bold text-[#517061]">{role.company} · {role.location}</p>{condition === "RAW_POSTING" ? <div className="mt-5 space-y-5 text-sm leading-7 text-[#587064]"><p>{role.summary}</p><MaterialList title="Responsibilities" items={role.responsibilities} /><MaterialList title="Required experience" items={[role.requiredExperience]} /><MaterialList title="Preferred experience" items={[role.preferredExperience]} /><MaterialList title="Work arrangement" items={[role.workArrangement]} /><MaterialList title="Candidate profile" items={role.candidateEvidence} /></div> : <div className="mt-5 space-y-4"><div className="rounded-2xl bg-[#e8efe6] p-5"><p className="metric-label">Recommended next step</p><p className="mt-2 font-serif text-3xl">{role.recommendation === "REVIEW_FURTHER" ? "Review Further" : role.recommendation === "APPLY" ? "Apply" : "Skip"}</p></div><DecisionItem label="Strong evidence" value={role.strongestEvidence} /><DecisionItem label="Attention area" value={role.weakestQualification} /><DecisionItem label="Required experience" value={role.requiredExperience} /><DecisionItem label="Preferred experience" value={role.preferredExperience} /><DecisionItem label="Work arrangement" value={role.workArrangement} /><details className="rounded-xl border border-[#173d2d]/10 p-4"><summary className="min-h-11 font-bold">View candidate evidence</summary><MaterialList title="Candidate profile" items={role.candidateEvidence} /></details></div>}</article>;
}

function AnswerGroup({ name, label, value, onChange, options, hideLegend = false }: { name: string; label: string; value: string; onChange: (value: string) => void; options: ReadonlyArray<readonly [string, string]>; hideLegend?: boolean }) { return <fieldset className="mt-6"><legend className={hideLegend ? "sr-only" : "font-serif text-xl"}>{label}</legend><div className="mt-3 grid gap-3">{options.map(([optionValue, optionLabel]) => <label key={optionValue} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-bold ${value === optionValue ? "border-[#315c49] bg-[#e8efe6]" : "border-[#173d2d]/10 bg-white"}`}><input type="radio" name={name} value={optionValue} checked={value === optionValue} onChange={() => onChange(optionValue)} />{optionLabel}</label>)}</div></fieldset>; }
function Rating({ label, value, onChange, low, high }: { label: string; value: number; onChange: (value: number) => void; low: string; high: string }) { return <fieldset><legend className="font-serif text-xl">{label}</legend><div className="mt-3 grid grid-cols-7 gap-2">{[1, 2, 3, 4, 5, 6, 7].map((rating) => <label key={rating} className={`grid min-h-12 place-items-center rounded-xl border font-bold ${value === rating ? "border-[#315c49] bg-[#e8efe6]" : "border-[#173d2d]/10"}`}><input className="sr-only" type="radio" name={label} checked={value === rating} onChange={() => onChange(rating)} />{rating}</label>)}</div><p className="mt-2 flex justify-between text-xs text-[#62796f]"><span>{low}</span><span>{high}</span></p></fieldset>; }
function DecisionItem({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-[#edf1e8] p-4"><p className="metric-label">{label}</p><p className="mt-2 font-bold">{value}</p></div>; }
function MaterialList({ title, items }: { title: string; items: string[] }) { return <section><h3 className="font-serif text-xl">{title}</h3><ul className="mt-2 space-y-2">{items.map((item) => <li key={item}>• {item}</li>)}</ul></section>; }
function Progress({ step, label }: { step: number; label: string }) { const percent = Math.round(step / 12 * 100); return <div className="mx-auto mb-7 max-w-7xl" aria-label={`Study progress: ${label}, step ${step} of 12`}><div className="flex justify-between gap-3 text-xs font-bold"><span>{label}</span><span>Step {step} of 12</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dfe6dc]"><div className="h-full rounded-full bg-[#6f927c]" style={{ width: `${percent}%` }} /></div></div>; }
function LocalOnly() { return <aside className="mt-7 flex items-start gap-3 rounded-2xl border border-[#315c49]/15 bg-[#e8efe6] p-5 text-sm leading-6"><HardDrive className="mt-0.5 size-5 shrink-0 text-[#a1742d]" /><p><b>Local-only storage.</b> Nothing is sent over the network. Export and reset remain under your control.</p></aside>; }
function StudyShell({ children, mode }: { children: React.ReactNode; mode?: StudyMode }) { return <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]">{mode === "PREVIEW" && <div className="bg-[#fff4d8] px-5 py-4 text-center text-sm"><b>Study Preview Mode</b><br />This session validates instructions and interaction only.<br />It will not be counted as participant evidence.</div>}{mode === "PILOT" && <div className="bg-[#fff4d8] px-5 py-3 text-center text-sm font-bold">Pilot Mode · This session validates clarity and will never be counted as final participant evidence.</div>}<header className="border-b border-[#173d2d]/10"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4"><span className="font-serif text-xl font-semibold">JobPilot Research</span><Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold"><ArrowLeft className="size-4" /> Exit study</Link></div></header><main className="mx-auto max-w-7xl px-5 py-8">{children}</main></div>; }

function patchSession(setter: React.Dispatch<React.SetStateAction<DecisionStudySession | null>>, patch: Partial<DecisionStudySession>) { setter((current) => current ? { ...current, ...patch } : current); window.scrollTo({ top: 0 }); }
function updateResponse(setter: React.Dispatch<React.SetStateAction<DecisionStudySession | null>>, index: number, patch: Partial<DecisionStudyResponse>) { setter((current) => { if (!current) return current; const responses = [...current.responses] as [DecisionStudyResponse, DecisionStudyResponse]; responses[index] = { ...responses[index], ...patch }; return { ...current, responses }; }); }
function download(name: string, content: string, type: string) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }
function resetStudy(setter: React.Dispatch<React.SetStateAction<DecisionStudySession | null>>, setPreScreen: (value: 0 | 1) => void) { window.localStorage.removeItem(DECISION_STUDY_STORAGE_KEY); setter(null); setPreScreen(0); window.scrollTo({ top: 0 }); }
