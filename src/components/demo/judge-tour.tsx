"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Play, RotateCcw, X } from "lucide-react";

const steps = [
  { label: "DISCOVER", title: "Nearby roles in one view", body: "Nearby roles are brought into one profile-aware view." },
  { label: "PRIORITIZE", title: "Decide where to look first", body: "Fit, Evidence Quality, recency, location, and blockers help you decide where to look first." },
  { label: "UNDERSTAND", title: "Separate required from preferred", body: "Required and preferred qualifications are separated." },
  { label: "INSPECT", title: "Trace evidence", body: "Every scored capability maps to job and candidate evidence." },
  { label: "VERIFY", title: "Reproduce the score", body: "This score was calculated by deterministic code and can be reproduced from its receipt." },
  { label: "APPLY", title: "Keep application control", body: "JobPilot opens the employer destination but never submits the application." },
  { label: "TRACK", title: "Keep the next step visible", body: "Save the opportunity and move it through your personal tracker." },
] as const;
const verified = ["Nearby discovery", "Resume-aware prioritization", "Required vs. preferred", "Relevant experience", "Exact score mathematics", "Direct employer destination", "No auto-apply"];

export function JudgeTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  function start() { setStep(0); setComplete(false); setOpen(true); }
  function next() { if (step === steps.length - 1) setComplete(true); else setStep((value) => value + 1); }
  useEffect(() => {
    if (!open) return;
    const prior = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); if (!complete && event.key === "ArrowRight") { if (step === steps.length - 1) setComplete(true); else setStep((value) => value + 1); } if (!complete && event.key === "ArrowLeft") setStep((value) => Math.max(0, value - 1)); };
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("keydown", keyboard); prior?.focus(); };
  }, [complete, open, step]);
  return <><button type="button" onClick={start} className="button-secondary mt-3"><Play className="size-4" /> Start the 90-Second Tour</button>{open && <div className="fixed inset-0 z-[90] grid place-items-center bg-[#0b2118]/60 p-4" role="presentation"><div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="judge-tour-title" className="w-full max-w-2xl rounded-3xl bg-[#fffdf7] p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Optional judge tour</p><h2 id="judge-tour-title" className="mt-2 font-serif text-3xl">{complete ? "Tour complete" : `${step + 1} / 7 — ${steps[step].label}`}</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Skip and close Judge Tour" className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#173d2d]/10"><X className="size-5" /></button></div>{complete ? <div className="mt-6"><p className="text-lg font-bold">You verified:</p><ul className="mt-4 grid gap-3 sm:grid-cols-2">{verified.map((item) => <li key={item} className="flex items-center gap-2 rounded-xl bg-[#edf4ea] p-3 text-sm font-semibold"><Check className="size-4 text-[#4e7a63]" />{item}</li>)}</ul><div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={start} className="button-secondary"><RotateCcw className="size-4" /> Restart Tour</button><Link href="/demo/jobs?sort=BEST_MATCH" className="button-primary">See My Best Matches</Link></div></div> : <div className="mt-6"><div className="h-2 overflow-hidden rounded-full bg-[#e2e7df]" aria-hidden="true"><div className="h-full bg-[#b08337] transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div><p className="sr-only" aria-live="polite">Step {step + 1} of 7</p><div className="mt-6 min-h-56 rounded-3xl bg-[#173d2d] p-7 text-[#fffaf0]"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#d9c992]">{steps[step].label}</p><h3 className="mt-3 font-serif text-4xl">{steps[step].title}</h3><p className="mt-5 text-lg leading-8 text-[#dce9df]">{steps[step].body}</p></div><div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setOpen(false)} className="min-h-11 px-3 text-sm font-bold underline underline-offset-4">Skip tour</button><div className="flex gap-2"><button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="button-secondary"><ArrowLeft className="size-4" /> Previous</button><button type="button" onClick={next} className="button-primary">{step === steps.length - 1 ? "Finish" : "Next"} <ArrowRight className="size-4" /></button></div></div></div>}</div></div>}</>;
}
