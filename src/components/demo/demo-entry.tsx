"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { resetDemoSession } from "@/components/demo/demo-store";

export function DemoEntry() {
  const router = useRouter();
  useEffect(() => {
    resetDemoSession();
    router.replace("/demo/jobs?tour=1");
  }, [router]);
  return <main className="grid min-h-screen place-items-center bg-[#fbf7ed] px-6 text-center text-[#173d2d]"><div><div className="mx-auto size-12 animate-pulse rounded-full border-4 border-[#b89a56] border-t-[#173d2d]" /><h1 className="mt-6 font-serif text-3xl">Preparing the synthetic demo</h1><p className="mt-3 text-[#61776c]">Creating an isolated browser-local session with an empty tracker.</p></div></main>;
}
