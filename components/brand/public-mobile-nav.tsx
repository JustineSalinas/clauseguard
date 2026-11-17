"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MobileDrawer } from "@/components/nav/mobile-drawer";
import { Logo } from "@/components/brand/logo";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/sample", label: "Sample review" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

/** Hamburger menu for the public site header, shown below `md`. */
export function PublicMobileNav({ triggerClassName = "" }: { triggerClassName?: string }) {
  return (
    <MobileDrawer title={<Logo size="sm" href="" />} triggerClassName={triggerClassName}>
      <nav className="flex flex-col px-3 py-4" aria-label="Site">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-ink-2 transition-colors hover:bg-raised hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-2.5 border-t border-rule p-4">
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-[#b04000] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#8f3400]"
        >
          Start for free
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-rule px-4 text-sm font-medium text-ink hover:bg-raised"
        >
          Sign in
        </Link>
      </div>
    </MobileDrawer>
  );
}
