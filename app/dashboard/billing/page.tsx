import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/sidebar";
import { BillingView } from "@/components/dashboard/billing-view";

export const metadata: Metadata = {
  title: "Plan & Billing | ClauseGuard",
  description:
    "Pricing and subscription tiers tailored for Philippine freelancers, contractors, and boutique agencies.",
};

export default async function Billing() {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard/billing");
  }

  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.users.me, {}, { token });
  const email = user?.email ?? "your account";

  return (
    <div className="min-h-screen bg-[#fafbfc] lg:flex">
      <Sidebar email={email} activeHref="/dashboard/billing" />
      <div className="flex-1">
        <BillingView email={email} />
      </div>
    </div>
  );
}
