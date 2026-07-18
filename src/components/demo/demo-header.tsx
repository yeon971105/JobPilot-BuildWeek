"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteNavigation } from "@/components/demo/site-navigation";

export function DemoHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className={`sticky top-0 z-40 border-b bg-[#fbf7ed]/90 backdrop-blur-xl transition-[box-shadow,border-color,background] duration-150 ${scrolled ? "border-[#173d2d]/15 shadow-[0_8px_24px_rgba(39,61,49,.09)]" : "border-[#173d2d]/10"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="inline-flex min-h-11 items-center font-serif text-xl font-semibold tracking-tight text-[#173d2d]">JobPilot</Link>
        <SiteNavigation ariaLabel="Demo navigation" />
      </div>
    </header>
  );
}
