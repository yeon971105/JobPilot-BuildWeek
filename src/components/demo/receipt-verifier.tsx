"use client";

import { useState } from "react";
import { CheckCircle2, Download, FileJson, ShieldAlert, Upload } from "lucide-react";
import { DemoHeader } from "@/components/demo/demo-header";
import type { ReceiptVerification } from "@/server/build-week/receipt-verifier";

export function ReceiptVerifierPage({ bundledReceipt, bundledVerification }: { bundledReceipt: Record<string, unknown>; bundledVerification: ReceiptVerification }) {
  const bundledText = JSON.stringify(bundledReceipt, null, 2);
  const [text, setText] = useState(bundledText);
  const [verification, setVerification] = useState<ReceiptVerification | null>(bundledVerification);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  async function verify() {
    setRunning(true); setError("");
    try {
      const response = await fetch("/api/verify-receipt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiptText: text }) });
      const payload = await response.json();
      if (!response.ok) { setVerification(null); setError(payload.message ?? "Receipt verification failed safely."); return; }
      setVerification(payload.verification);
    } catch { setVerification(null); setError("The local verifier request could not be completed."); } finally { setRunning(false); }
  }
  async function loadFile(file: File | null) {
    if (!file) return;
    if (file.type && file.type !== "application/json" || !file.name.toLowerCase().endsWith(".json")) { setError("Choose a JSON receipt file."); return; }
    if (file.size > 1_048_576) { setError("Receipt JSON must be 1 MB or smaller."); return; }
    setText(await file.text()); setVerification(null); setError("");
  }
  function downloadReport() {
    if (!verification) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(verification, null, 2)], { type: "application/json" }));
    link.download = "jobpilot-receipt-verification.json"; link.click(); URL.revokeObjectURL(link.href);
  }
  return <div className="min-h-screen bg-[#fbf7ed] text-[#173d2d]"><DemoHeader /><main className="mx-auto max-w-6xl px-5 py-10"><p className="eyebrow"><FileJson className="size-4" /> Independent score proof</p><h1 className="mt-3 font-serif text-5xl">Verify a Score Receipt</h1><p className="mt-4 max-w-3xl text-lg leading-8 text-[#587064]">Reproduce canonical hashing, micro-point arithmetic, class caps, transfers, rounding, evidence IDs, and frozen source inputs. The verifier never needs private resume text or an external request.</p><div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><section className="paper-card"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-2xl">Receipt JSON</h2><button type="button" onClick={() => { setText(bundledText); setVerification(bundledVerification); setError(""); }} className="button-secondary">Use bundled demo receipt</button></div><label className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#315c49]/25 bg-[#edf4ea] p-5 text-center"><Upload className="size-5" /><span className="mt-2 font-bold">Choose JSON receipt · maximum 1 MB</span><input type="file" accept="application/json,.json" className="sr-only" onChange={(event) => void loadFile(event.target.files?.[0] ?? null)} /></label><label className="mt-5 block font-bold">Paste or inspect JSON<textarea data-testid="receipt-input" className="form-control min-h-[360px] font-mono text-xs leading-5" value={text} onChange={(event) => { setText(event.target.value); setVerification(null); }} /></label><button type="button" onClick={verify} disabled={running} className="button-primary mt-5">{running ? "Verifying…" : "Verify Receipt"}</button>{error && <p role="alert" className="mt-4 rounded-xl bg-[#f8e6df] p-4 text-sm font-bold">{error}</p>}</section><section aria-live="polite"><VerificationResult verification={verification} onDownload={downloadReport} /></section></div><section className="paper-card mt-6"><h2 className="font-serif text-2xl">Verification statuses</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><StatusCard title="FULLY_REPRODUCED" body="Hash, arithmetic, evidence IDs, and bundled frozen source inputs reproduce exactly." /><StatusCard title="ARITHMETICALLY_VALID" body="Hash and score mathematics are valid, but original source inputs are unavailable." /><StatusCard title="INVALID" body="At least one schema, hash, arithmetic, cap, evidence, or source check failed." /><StatusCard title="UNSUPPORTED_VERSION" body="The receipt version is outside this verifier’s supported contract." /></div></section></main></div>;
}

function VerificationResult({ verification, onDownload }: { verification: ReceiptVerification | null; onDownload: () => void }) {
  if (!verification) return <div className="paper-card"><ShieldAlert className="size-6 text-[#a1742d]" /><h2 className="mt-4 font-serif text-3xl">Ready to verify</h2><p className="mt-3 text-sm leading-6 text-[#587064]">Choose the bundled receipt, upload JSON, or paste a receipt. Input is bounded before arithmetic validation.</p></div>;
  const passed = verification.status === "FULLY_REPRODUCED" || verification.status === "ARITHMETICALLY_VALID";
  return <div className="paper-card"><div className={`rounded-2xl p-5 ${passed ? "bg-[#edf4ea]" : "bg-[#f8e6df]"}`}><p className="text-xs font-bold uppercase tracking-[.12em]">Verification result</p><h2 data-testid="verification-status" className="mt-2 break-words font-serif text-3xl">{verification.status}</h2><p className="mt-2 text-sm">{verification.checks.filter((item) => item.passed).length} passed · {verification.failedChecks.length} failed checks</p></div><div className="mt-5 max-h-[560px] space-y-2 overflow-auto pr-1">{verification.checks.map((item) => <div key={item.id} className={`rounded-xl p-3 text-sm ${item.passed ? "bg-[#edf1e8]" : "bg-[#fff4d8]"}`}><p className="flex items-center gap-2 font-bold">{item.passed ? <CheckCircle2 className="size-4 text-[#4e7a63]" /> : <ShieldAlert className="size-4 text-[#a1742d]" />}{item.id}</p><p className="mt-1 leading-5 text-[#587064]">{item.message}</p></div>)}</div><button type="button" onClick={onDownload} className="button-secondary mt-5"><Download className="size-4" /> Download verification report</button><p className="mt-4 text-xs text-[#62796f]">External requests: 0 · Private resume required: No</p></div>;
}
function StatusCard({ title, body }: { title: string; body: string }) { return <article className="rounded-2xl bg-[#edf1e8] p-4"><h3 className="break-words font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#587064]">{body}</p></article>; }
