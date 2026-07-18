"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/demo/jobs", label: "Jobs" },
  { href: "/demo/tracker", label: "Tracker" },
  { href: "/demo/trust", label: "Trust Lab" },
  { href: "/about/build-week", label: "Build Week" },
];

export function SiteNavigation({ ariaLabel = "Primary navigation" }: { ariaLabel?: string }) {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || (href === "/demo/jobs" && pathname.startsWith("/demo/jobs/"));

  return (
    <nav aria-label={ariaLabel} className="flex shrink-0 items-center gap-1">
      <div className="hidden items-center gap-1 text-sm font-semibold text-[#315c49] sm:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={`rounded-full px-3 py-2 transition-colors hover:bg-[#e7ece4] ${active(link.href) ? "bg-[#e7dcc1] text-[#173d2d]" : ""}`}>
            {link.label}
          </Link>
        ))}
      </div>
      <details className="relative sm:hidden">
        <summary className="grid size-11 list-none place-items-center rounded-xl border border-[#173d2d]/15 bg-[#fffdf7] text-[#173d2d] [&::-webkit-details-marker]:hidden">
          <Menu className="size-5" aria-hidden="true" />
          <span className="sr-only">Open navigation</span>
        </summary>
        <div className="absolute right-0 z-50 mt-2 grid min-w-48 gap-1 rounded-2xl border border-[#173d2d]/10 bg-[#fffdf7] p-2 shadow-[0_18px_45px_rgba(39,61,49,.18)]">
          {links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={`min-h-11 rounded-xl px-4 py-3 text-sm font-semibold ${active(link.href) ? "bg-[#e7dcc1] text-[#173d2d]" : "text-[#315c49]"}`}>
              {link.label}
            </Link>
          ))}
        </div>
      </details>
    </nav>
  );
}
