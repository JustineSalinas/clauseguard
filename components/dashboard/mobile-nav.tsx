"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { MobileDrawer } from "@/components/nav/mobile-drawer";
import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { TourButton } from "@/components/dashboard/product-tour";
import { NAV_ITEMS } from "@/components/dashboard/nav-items";

/** Dashboard navigation for viewports below `lg`, where the sidebar is hidden. */
export function MobileNav({ email, activeHref }: { email: string; activeHref: string }) {
  return (
    <MobileDrawer title={<Logo size="sm" href="" />} label="Navigation menu">
      <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Workspace">
        <div className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-wider text-ink-3 uppercase">
          Workspace
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-[0.9375rem] font-medium transition-colors ${
                isActive
                  ? "bg-[#fbeee4] font-semibold text-[#b04000]"
                  : "text-ink-2 hover:bg-raised hover:text-ink"
              }`}
            >
              <item.icon className={`size-4.5 ${isActive ? "text-[#b04000]" : "text-ink-3"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 pb-4">
        <TourButton className="w-full justify-center" />
      </div>
      <div className="border-t border-rule p-4">
        <div className="mb-2 flex items-center gap-2 text-[0.75rem] text-ink-3">
          <Shield className="size-3.5 text-[#b04000]" />
          <span className="truncate" title={email}>
            {email}
          </span>
        </div>
        <SignOutButton className="w-full justify-start text-sm text-ink-2" />
      </div>
    </MobileDrawer>
  );
}
