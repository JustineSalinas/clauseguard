import {
  FileText,
  FileSearch,
  CreditCard,
  Settings,
  BookOpen,
  BookMarked,
  History,
} from "lucide-react";

/** Shared by the desktop sidebar and the mobile/tablet drawer. */
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Your contracts", icon: FileText, tourId: "nav-contracts" },
  { href: "/dashboard/sample", label: "Sample reviews", icon: FileSearch, tourId: "nav-sample" },
  { href: "/dashboard/activity", label: "Activity log", icon: History, tourId: "nav-activity" },
  { href: "/dashboard/corpus", label: "Legal corpus", icon: BookOpen, tourId: "nav-corpus" },
  { href: "/dashboard/playbook", label: "Pushback playbook", icon: BookMarked, tourId: "nav-playbook" },
  { href: "/dashboard/billing", label: "Plan & billing", icon: CreditCard, tourId: "nav-billing" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, tourId: "nav-settings" },
] as const;

/**
 * Which nav item a pathname belongs to. A review page (/dashboard/<id>) and
 * its report sit under "Your contracts", so match on the longest nav prefix
 * and fall back to the contracts list for anything else under /dashboard.
 */
export function activeNavHref(pathname: string): string {
  const match = NAV_ITEMS.filter(
    (i) => i.href !== "/dashboard" && (pathname === i.href || pathname.startsWith(i.href + "/")),
  ).sort((a, b) => b.href.length - a.href.length)[0];
  return match?.href ?? "/dashboard";
}
