"use client";

import Link from "next/link";
import { ChevronDown, UserRound } from "lucide-react";
import { resetDemoSession } from "@/components/demo/demo-store";
import { usePrivateProfile } from "@/components/profile/profile-store";

export function ProfileMenu() {
  const profile = usePrivateProfile();
  const label = profile.mode === "PRIVATE" && profile.profile ? "Private Local Profile" : "Demo Candidate A";
  return <details className="profile-menu relative">
    <summary className="flex min-h-11 list-none items-center gap-2 rounded-full border border-[#173d2d]/12 bg-white/70 px-3 text-xs font-bold text-[#315c49] [&::-webkit-details-marker]:hidden"><UserRound className="size-4" /> <span className="hidden lg:inline">{label}</span><ChevronDown className="size-3" /></summary>
    <div className="profile-menu-panel absolute right-0 z-50 mt-2 grid min-w-64 gap-1 rounded-2xl border border-[#173d2d]/10 bg-[#fffdf7] p-2 shadow-[0_18px_45px_rgba(39,61,49,.18)]">
      <Link href="/profile" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#edf1e8]">View Profile</Link>
      <button type="button" onClick={() => profile.useDemoProfile()} className="rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-[#edf1e8]">Use Demo Profile</button>
      <Link href="/profile/resume" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#edf1e8]">Upload Resume Privately</Link>
      <Link href="/profile/preferences" className="rounded-xl px-4 py-3 text-sm font-semibold hover:bg-[#edf1e8]">Edit Preferences</Link>
      <button type="button" onClick={() => { resetDemoSession(); profile.useDemoProfile(); }} className="rounded-xl px-4 py-3 text-left text-sm font-semibold hover:bg-[#edf1e8]">Reset Demo Session</button>
    </div>
  </details>;
}
