import Link from "next/link";
import { SiteNavigation } from "@/components/demo/site-navigation";

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#173d2d]/10 bg-[#fbf7ed]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="inline-flex min-h-11 items-center font-serif text-xl font-semibold tracking-tight text-[#173d2d]">JobPilot</Link>
        <SiteNavigation ariaLabel="Demo navigation" />
      </div>
    </header>
  );
}
