import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { TourButton } from "@/components/dashboard/product-tour";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { NAV_ITEMS } from "@/components/dashboard/nav-items";
import { Shield, Settings } from "lucide-react";

export { NAV_ITEMS };

export function Sidebar({ email, activeHref }: { email: string; activeHref: string }) {
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-rule bg-surface lg:flex">
        <div>
          {/* Logo header */}
          <div className="flex items-center justify-between gap-2 border-b border-rule px-6 py-5" data-tour="logo">
            <Logo size="sm" href="/" />
          </div>

          <div className="px-3 pt-3">
            <TourButton className="w-full justify-center" />
          </div>

          {/* Navigation links */}
          <nav className="flex flex-col gap-1 px-3 py-4">
            <div className="px-3 pb-2 text-[0.6875rem] font-semibold tracking-wider text-ink-3 uppercase">
              Workspace
            </div>
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === activeHref;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.tourId}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.875rem] font-medium transition-all ${
                    isActive
                      ? "bg-[#fbeee4] text-[#b04000] font-semibold shadow-2xs"
                      : "text-ink-2 hover:bg-raised hover:text-ink"
                  }`}
                >
                  <item.icon className={`size-4 ${isActive ? "text-[#b04000]" : "text-ink-3"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* User profile & session footer */}
        <div className="border-t border-rule p-4" data-tour="profile">
          <div className="flex items-center justify-between rounded-lg bg-raised p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#08090a] font-display text-xs font-semibold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8125rem] font-medium text-ink" title={email}>
                  {email}
                </p>
                <div className="flex items-center gap-1 text-[0.6875rem] text-ink-3">
                  <Shield className="size-3 text-[#b04000]" />
                  <span>Research Preview</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/settings"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface hover:text-ink"
              title="Account Settings"
            >
              <Settings className="size-3.5" />
            </Link>
          </div>
          <div className="mt-2.5">
            <SignOutButton className="w-full justify-start text-xs text-ink-2 hover:bg-raised hover:text-ink" />
          </div>
        </div>
      </aside>

      {/* Mobile/tablet header: logo, hamburger drawer with the full nav. */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-rule bg-surface px-4 py-2.5 lg:hidden">
        <Logo size="sm" href="/dashboard" />
        <MobileNav email={email} activeHref={activeHref} />
      </header>
    </>
  );
}
