"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DemoError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#fbf7ed] px-5 text-[#173d2d]"><section className="paper-card max-w-xl text-center" role="alert"><AlertTriangle className="mx-auto size-9 text-[#8b493e]" /><p className="eyebrow mt-5">Decision view unavailable</p><h1 className="mt-3 font-serif text-4xl">This view could not be prepared.</h1><p className="mt-4 leading-7 text-[#587064]">Your browser-local tracker is unchanged. Try the view again or return to your three focused roles.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={reset} className="button-primary"><RotateCcw className="size-4" /> Try again</button><Link href="/demo/shortlist" className="button-secondary">Return to For You</Link></div></section></main>;
}
