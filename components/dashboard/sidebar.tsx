import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { FileText, FileSearch, CreditCard } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Your contracts", icon: FileText },
  { href: "/sample", label: "Sample review", icon: FileSearch },
  { href: "/dashboard/billing", label: "Plan & billing", icon: CreditCard },
] as const;

/**
 * Shared between every signed-in page so the nav can't drift between them
 * (each page used to define its own copy -- one bug fix away from the
 * sidebar showing a different set of links depending which page you're on).
 * Real destinations only, per this project's "no invented affordances"
 * rule -- every entry here is a page that actually exists and does
 * something.
 */
export function Sidebar({ email, activeHref }: { email: string; activeHref: string }) {
  return (
    <>
      <aside className="hidden w-60 shrink-0 flex-col border-r border-rule bg-surface lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size="sm" />
            <span className="font-display text-[0.9375rem] font-semibold tracking-tight">
              Clause<span className="text-brand">Guard</span>
            </span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[5px] px-3 py-2 text-[0.875rem] font-medium transition-colors ${
                item.href === activeHref
                  ? "bg-[#fbeee4] text-[#b04000]"
                  : "text-ink-2 hover:bg-raised hover:text-ink"
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-rule p-4">
          <p className="truncate text-[0.8125rem] font-medium text-ink">{email}</p>
          <p className="mt-0.5 text-[0.75rem] text-ink-3">Signed in</p>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Mobile-only top bar, since the sidebar hides below lg. */}
      <header className="flex items-center justify-between border-b border-rule px-5 py-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark size="sm" />
          <span className="font-display text-[0.9375rem] font-semibold tracking-tight">
            Clause<span className="text-brand">Guard</span>
          </span>
        </Link>
        <SignOutButton />
      </header>
    </>
  );
}
