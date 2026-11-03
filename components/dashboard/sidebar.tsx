import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  FileText,
  FileSearch,
  CreditCard,
  Settings,
  Scale,
  Shield,
  BookOpen,
  BookMarked,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Your contracts", icon: FileText },
  { href: "/dashboard/sample", label: "Sample review", icon: FileSearch },
  { href: "/dashboard/corpus", label: "Legal corpus", icon: BookOpen },
  { href: "/dashboard/playbook", label: "Pushback playbook", icon: BookMarked },
  { href: "/dashboard/billing", label: "Plan & billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ email, activeHref }: { email: string; activeHref: string }) {
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto border-r border-rule bg-surface lg:flex">
        <div>
          {/* Logo header */}
          <div className="flex items-center gap-2 border-b border-rule px-6 py-5">
            <Logo size="sm" href="/" />
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

          {/* Statutory Corpus Info Card with clickable link */}
          <Link
            href="/dashboard/corpus"
            className="group mx-3 mt-2 block rounded-lg border border-rule bg-[#fafbfc] p-3.5 transition-colors hover:border-[#b04000]/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink group-hover:text-[#b04000]">
                <Scale className="size-3.5 text-[#b04000]" />
                <span>PH Legal Corpus</span>
              </div>
              <span className="rounded bg-[#0c8c5e]/10 px-1.5 py-0.5 font-mono text-[0.625rem] font-medium text-[#0c8c5e]">
                320 Arts.
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-3 leading-relaxed">
              Civil Code &amp; Labor Code indexed for live RAG grounding.
            </p>
          </Link>
        </div>

        {/* User profile & session footer */}
        <div className="border-t border-rule p-4">
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

      {/* Mobile-only header navigation */}
      <header className="flex items-center justify-between border-b border-rule bg-surface px-5 py-3.5 lg:hidden">
        <Logo size="sm" href="/" />
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings"
            className="inline-flex size-8 items-center justify-center rounded-md border border-rule text-ink-2 hover:bg-raised"
            title="Settings"
          >
            <Settings className="size-4" />
          </Link>
          <SignOutButton size="xs" variant="outline" />
        </div>
      </header>
    </>
  );
}
