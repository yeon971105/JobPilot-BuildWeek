"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Check, FileText, LockKeyhole, Plus, Trash2, Upload } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import { usePrivateProfile } from "@/components/profile/profile-store";
import type { PrivateProfile } from "@/lib/private-profile";

export function ResumeOnboarding({ enabled }: { enabled: boolean }) {
  const store = usePrivateProfile();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"IDLE" | "PARSING" | "REVIEW" | "ERROR" | "CONFIRMED">("IDLE");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<PrivateProfile | null>(null);

  function useSyntheticTestResume() {
    const text = [
      "Experience",
      "Senior Platform Engineer | Northwind Labs",
      "January 2021 - Present",
      "Built reliable TypeScript and Kubernetes services for enterprise teams.",
      "Projects",
      "Evidence Console: Shipped an auditable evidence review workflow.",
      "Skills",
      "TypeScript, Kubernetes, PostgreSQL, Accessibility",
      "Education",
      "BS Computer Science, Synthetic University",
      "Certifications",
      "Synthetic Cloud Practitioner",
    ].join("\n");
    setFile(new File([text], "synthetic-jobpilot-resume.txt", { type: "text/plain" }));
    setStatus("IDLE");
    setMessage("");
  }

  async function parseResume() {
    if (!file || !enabled) return;
    setStatus("PARSING"); setMessage("");
    const form = new FormData(); form.append("resume", file);
    try {
      const response = await fetch("/api/private/resume", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) { setStatus("ERROR"); setMessage(payload.message || "The resume could not be parsed."); return; }
      setDraft(payload.profile); setFile(null); setStatus("REVIEW");
    } catch { setStatus("ERROR"); setMessage("The local JobPilot parser is unavailable."); }
  }

  function confirmProfile() {
    if (!draft) return;
    const present = [draft.roleHistory.length, draft.projects.length, draft.skills.length, draft.education.length, draft.certifications.length].filter(Boolean).length;
    const confirmed = { ...draft, confirmedAt: new Date().toISOString(), completeness: Math.round((present / 5) * 100) };
    store.setProfile(confirmed); setDraft(confirmed); setStatus("CONFIRMED");
  }

  return <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]"><DemoHeader /><main className="mx-auto max-w-5xl px-5 py-10">
    <p className="eyebrow"><LockKeyhole className="size-4" /> Local Private Mode</p><h1 className="mt-3 font-serif text-5xl">Use your resume privately.</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-[#587064]">Your resume is processed by the local JobPilot application. It is not sent to OpenAI or another cloud model.</p>
    {!enabled ? <PublicModeNotice /> : status === "REVIEW" || status === "CONFIRMED" ? <ProfileReview draft={draft!} setDraft={setDraft} confirmed={status === "CONFIRMED"} onConfirm={confirmProfile} /> : <section className="paper-card mt-8"><div className="grid gap-6 md:grid-cols-[1fr_280px]"><div><h2 className="font-serif text-3xl">Choose one resume</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#62796f]">PDF, DOCX, or UTF-8 TXT · maximum 10 MB · no OCR · no legacy DOC or macro content.</p><label className="mt-6 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#315c49]/25 bg-[#edf4ea] p-6 text-center"><Upload className="size-7" /><span className="mt-3 font-bold">{file ? file.name : "Select a local resume"}</span><span className="mt-1 text-sm text-[#62796f]">The raw file is not persisted.</span><input data-testid="private-resume-input" type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label><div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={!file || status === "PARSING"} onClick={parseResume} className="button-primary">{status === "PARSING" ? "Parsing locally…" : "Parse Resume Locally"}</button><button type="button" onClick={useSyntheticTestResume} className="button-secondary">Use Synthetic Test Resume</button></div>{status === "ERROR" && <p role="alert" className="mt-4 rounded-xl bg-[#f8e6df] p-4 text-sm font-semibold"><AlertTriangle className="mr-2 inline size-4" />{message}</p>}</div><aside className="rounded-2xl bg-[#173d2d] p-5 text-[#fffaf0]"><h2 className="font-serif text-2xl">Privacy boundary</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-[#dce9df]"><li>• In-memory parsing</li><li>• No raw resume logs</li><li>• No raw file persistence</li><li>• No cloud model calls</li><li>• Only hashes and minimal processing metadata</li></ul></aside></div></section>}
  </main></div>;
}

function PublicModeNotice() {
  return <section className="paper-card mt-8"><FileText className="size-7 text-[#a1742d]" /><h2 className="mt-4 font-serif text-3xl">Available in the local edition</h2><p className="mt-3 max-w-2xl leading-7 text-[#587064]">Private resume analysis is available in the local JobPilot edition so your resume stays on your device. This public deployment does not accept or transmit resume files.</p><div className="mt-6 rounded-2xl bg-[#edf1e8] p-5 text-sm leading-7"><p className="font-bold">Local setup</p><code className="mt-2 block">LOCAL_PRIVATE_MODE=true</code><code className="block">OLLAMA_ENABLED=true</code><code className="block">OLLAMA_MODEL=gemma4:12b</code><p className="mt-3">Run <code>npm install</code>, start Ollama locally, then start JobPilot. No OpenAI key is required.</p></div><Link href="/profile/private-mode" className="button-primary mt-6">Open Local Setup Guide</Link></section>;
}

function ProfileReview({ draft, setDraft, confirmed, onConfirm }: { draft: PrivateProfile; setDraft: (profile: PrivateProfile) => void; confirmed: boolean; onConfirm: () => void }) {
  const updateRole = (index: number, field: string, value: string) => setDraft({ ...draft, roleHistory: draft.roleHistory.map((role, item) => item === index ? { ...role, [field]: value } : role) });
  return <section className="mt-8"><div className="paper-card"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#a1742d]">Extraction review</p><h2 className="mt-2 font-serif text-3xl">Confirm only what is accurate.</h2><p className="mt-3 text-sm leading-6 text-[#62796f]">Edit, remove, or add items. JobPilot does not infer protected attributes or photograph traits.</p></div><span className="pill">{draft.format} · {draft.completeness}% complete</span></div>{draft.warnings.length > 0 && <div className="mt-5 rounded-2xl bg-[#fff4d8] p-4"><p className="font-bold">Profile warnings</p><ul className="mt-2 space-y-1 text-sm">{draft.warnings.map((warning) => <li key={warning}>• {warning}</li>)}</ul></div>}</div>
    <ReviewSection title="Role history" onAdd={() => setDraft({ ...draft, roleHistory: [...draft.roleHistory, { id: `role-${Date.now()}`, title: "", organization: "", startMonth: "", endMonth: "", summary: "" }] })}>{draft.roleHistory.map((role, index) => <article key={role.id} className="review-row"><div className="grid gap-3 sm:grid-cols-2"><Field label="Role" value={role.title} onChange={(value) => updateRole(index, "title", value)} /><Field label="Organization" value={role.organization} onChange={(value) => updateRole(index, "organization", value)} /><Field label="Start month" value={role.startMonth} onChange={(value) => updateRole(index, "startMonth", value)} /><Field label="End month" value={role.endMonth} onChange={(value) => updateRole(index, "endMonth", value)} /></div><Field label="Evidence summary" value={role.summary} multiline onChange={(value) => updateRole(index, "summary", value)} /><button type="button" className="remove-button" onClick={() => setDraft({ ...draft, roleHistory: draft.roleHistory.filter((_, item) => item !== index) })}><Trash2 className="size-4" /> Remove role</button></article>)}</ReviewSection>
    <ReviewSection title="Projects" onAdd={() => setDraft({ ...draft, projects: [...draft.projects, { id: `project-${Date.now()}`, name: "", summary: "" }] })}>{draft.projects.map((project, index) => <article key={project.id} className="review-row"><Field label="Project" value={project.name} onChange={(value) => setDraft({ ...draft, projects: draft.projects.map((item, position) => position === index ? { ...item, name: value } : item) })} /><Field label="Project evidence" value={project.summary} multiline onChange={(value) => setDraft({ ...draft, projects: draft.projects.map((item, position) => position === index ? { ...item, summary: value } : item) })} /><button type="button" className="remove-button" onClick={() => setDraft({ ...draft, projects: draft.projects.filter((_, item) => item !== index) })}><Trash2 className="size-4" /> Remove project</button></article>)}</ReviewSection>
    <ReviewSection title="Skills"><ListField label="Skills, separated by commas" values={draft.skills} onChange={(skills) => setDraft({ ...draft, skills })} /></ReviewSection>
    <ReviewSection title="Education and certifications"><ListField label="Education, one item per line" values={draft.education} lines onChange={(education) => setDraft({ ...draft, education })} /><ListField label="Certifications, one item per line" values={draft.certifications} lines onChange={(certifications) => setDraft({ ...draft, certifications })} /></ReviewSection>
    <ReviewSection title="Candidate evidence excerpts" onAdd={() => setDraft({ ...draft, evidence: [...draft.evidence, { id: `EVD-PRIVATE-${Date.now()}`, label: "New evidence", text: "", capabilities: [] }] })}>{draft.evidence.map((evidence, index) => <article key={evidence.id} className="review-row"><Field label="Evidence label" value={evidence.label} onChange={(value) => setDraft({ ...draft, evidence: draft.evidence.map((item, position) => position === index ? { ...item, label: value } : item) })} /><Field label="Evidence excerpt" value={evidence.text} multiline onChange={(value) => setDraft({ ...draft, evidence: draft.evidence.map((item, position) => position === index ? { ...item, text: value.slice(0, 320) } : item) })} /><button type="button" className="remove-button" onClick={() => setDraft({ ...draft, evidence: draft.evidence.filter((_, item) => item !== index) })}><Trash2 className="size-4" /> Remove evidence</button></article>)}</ReviewSection>
    <div className="paper-card mt-5 flex flex-wrap items-center justify-between gap-4">{confirmed ? <p className="font-bold text-[#315c49]"><Check className="mr-2 inline size-5" />Private profile confirmed and stored locally.</p> : <button type="button" className="button-primary" onClick={onConfirm}>Confirm Private Profile</button>}<div className="flex flex-wrap gap-3"><Link href="/profile/preferences" className="button-secondary">Set Work Preferences</Link>{confirmed && <Link href="/demo/jobs/alder-data-platform-engineer" className="button-primary">Analyze a Role Privately</Link>}</div></div>
  </section>;
}

function ReviewSection({ title, onAdd, children }: { title: string; onAdd?: () => void; children: React.ReactNode }) { return <section className="paper-card mt-5"><div className="flex items-center justify-between gap-3"><h3 className="font-serif text-2xl">{title}</h3>{onAdd && <button type="button" className="button-secondary" onClick={onAdd}><Plus className="size-4" /> Add item</button>}</div><div className="mt-5 space-y-4">{children}</div></section>; }
function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) { return <label className="mt-3 block text-sm font-bold">{label}{multiline ? <textarea value={value} rows={3} onChange={(event) => onChange(event.target.value)} className="form-control" /> : <input value={value} onChange={(event) => onChange(event.target.value)} className="form-control" />}</label>; }
function ListField({ label, values, onChange, lines = false }: { label: string; values: string[]; onChange: (values: string[]) => void; lines?: boolean }) { const separator = lines ? "\n" : ", "; return <label className="block text-sm font-bold">{label}<textarea value={values.join(separator)} rows={4} onChange={(event) => onChange(event.target.value.split(lines ? /\n/ : /,/).map((value) => value.trim()).filter(Boolean))} className="form-control" /></label>; }
