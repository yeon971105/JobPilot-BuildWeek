"use client";

import Link from "next/link";
import { FileUp, RotateCcw, Settings2, ShieldCheck, Trash2 } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import { usePrivateProfile } from "@/components/profile/profile-store";

export function ProfileOverview() {
  const state = usePrivateProfile();
  const privateActive = state.mode === "PRIVATE" && state.profile;
  const preferences = state.preferences;
  return <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]"><DemoHeader /><main className="mx-auto max-w-6xl px-5 py-10">
    <p className="eyebrow"><ShieldCheck className="size-4" /> Profile control</p><h1 className="mt-3 font-serif text-5xl">Your evidence, your choice.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[#587064]">Use the synthetic profile for the public demo, or keep a structured profile from your resume in this browser on your local JobPilot edition.</p>
    <section className="paper-card mt-8" aria-labelledby="current-profile-title"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a1742d]">Current profile</p><h2 id="current-profile-title" className="mt-2 font-serif text-3xl">{privateActive ? "Private Local Resume" : "Demo Candidate A"}</h2><p className="mt-2 text-[#62796f]">Source: {privateActive ? "Private Local Resume" : "Synthetic Demo"}</p></div><span className="pill">{privateActive ? `${state.profile!.completeness}% complete` : "100% demo ready"}</span></div>
      <dl className="mt-6 grid gap-4 rounded-2xl bg-[#edf1e8] p-5 sm:grid-cols-3"><div><dt className="metric-label">Last analyzed</dt><dd className="mt-2 font-semibold">{privateActive ? (Object.values(state.analyses).sort((a,b)=>b.analyzedAt.localeCompare(a.analyzedAt))[0]?.analyzedAt ? new Date(Object.values(state.analyses).sort((a,b)=>b.analyzedAt.localeCompare(a.analyzedAt))[0]!.analyzedAt).toLocaleString() : "Not analyzed yet") : "Prepared demo analysis"}</dd></div><div><dt className="metric-label">Work modes</dt><dd className="mt-2 font-semibold">{preferences.acceptedWorkModes.join(", ") || "No preference set"}</dd></div><div><dt className="metric-label">Travel tolerance</dt><dd className="mt-2 font-semibold">{preferences.maximumTravelPercent === null ? "No preference set" : `${preferences.maximumTravelPercent}% maximum`}</dd></div></dl>
      <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={state.useDemoProfile} className="button-secondary"><RotateCcw className="size-4" /> Use Demo Profile</button><Link href="/profile/resume" className="button-primary"><FileUp className="size-4" /> Upload Resume Privately</Link><Link href="/profile/preferences" className="button-secondary"><Settings2 className="size-4" /> Edit Preferences</Link>{state.profile && <button type="button" onClick={state.clearLocalProfile} className="button-danger"><Trash2 className="size-4" /> Clear Local Profile</button>}</div>
    </section>
    {state.profile && !privateActive && <aside className="mt-5 rounded-2xl border border-[#173d2d]/10 bg-white/65 p-5"><p className="font-semibold">A confirmed private profile is available on this device.</p><button type="button" onClick={state.usePrivateProfileMode} className="button-secondary mt-3">Use Private Local Profile</button></aside>}
  </main></div>;
}
