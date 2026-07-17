import Link from "next/link";

export function DemoHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#173d2d]/10 bg-[#fbf7ed]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-[#173d2d]">JobPilot</Link>
        <nav aria-label="Demo navigation" className="flex items-center gap-3 text-sm font-semibold text-[#315c49] sm:gap-6">
          <Link href="/demo/jobs">Jobs</Link>
          <Link href="/demo/tracker">Tracker</Link>
          <Link href="/demo/trust">Trust Lab</Link>
          <Link href="/about/build-week" className="hidden sm:inline">Build Week</Link>
        </nav>
      </div>
    </header>
  );
}
