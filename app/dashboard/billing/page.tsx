import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Plan & billing" };

/**
 * No payment processor is wired up (Stripe/PayMongo/etc. -- none of that
 * integration work has happened). This page is honest about that: it shows
 * what the free tier actually includes and what a paid tier would cost, but
 * "Upgrade" is deliberately not a working checkout button -- a disabled
 * affordance that says what it is beats a fake Stripe modal that charges
 * nothing and goes nowhere, same reasoning as the hero dropzone fix earlier
 * in this project's history.
 */

const FREE_FEATURES = [
  "Unlimited contract uploads while this is in research preview",
  "Clause segmentation and risk classification",
  "Every flag grounded in the Civil Code or Labor Code, cited",
  "Confidence score on every clause, including “not sure”",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Priority processing queue",
  "Redline suggestion export",
  "Review history across all your contracts",
];

export default async function Billing() {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard/billing");
  }

  const token = await convexAuthNextjsToken();
  const user = await fetchQuery(api.users.me, {}, { token });
  const email = user?.email ?? "your account";

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar email={email} activeHref="/dashboard/billing" />

      <div className="flex-1">

        <main className="mx-auto max-w-5xl px-6 py-10 lg:px-10 lg:py-12">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Plan &amp; billing</h1>
          <p className="mt-1.5 text-[0.9375rem] text-ink-2">
            Priced for Philippine freelancers and small businesses — not an enterprise seat count.
          </p>

          <div className="mt-8 rounded-[6px] border border-[#e8c6a8] bg-[#fbeee4] px-5 py-4">
            <p className="text-[0.8125rem] font-semibold text-[#b04000]">Currently on: Free</p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-[#8a3300]">
              ClauseGuard is in research preview for a University of San Agustin capstone project.
              Pricing below reflects what a production launch would look like — nothing is
              charged today.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-[8px] border border-rule bg-surface p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold">Free</h2>
                <span className="text-2xl font-semibold tracking-tight">₱0</span>
              </div>
              <p className="mt-1 text-[0.8125rem] text-ink-3">Forever, during research preview</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.875rem] text-ink-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[#b04000]" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-[4px] bg-raised px-3 py-2 text-center text-[0.8125rem] font-medium text-ink-2">
                Your current plan
              </div>
            </div>

            <div className="rounded-[8px] border border-rule bg-surface p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold">Pro</h2>
                <span className="text-2xl font-semibold tracking-tight">
                  ₱299<span className="text-sm font-normal text-ink-3">/mo</span>
                </span>
              </div>
              <p className="mt-1 text-[0.8125rem] text-ink-3">Planned pricing, not yet live</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.875rem] text-ink-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[#b04000]" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-[4px] border border-rule bg-raised px-3 py-2 text-[0.8125rem] font-medium text-ink-3"
                title="Billing isn't connected yet — this plan doesn't charge anyone."
              >
                Coming soon
              </button>
            </div>
          </div>

          <p className="mt-8 text-[0.8125rem] text-ink-3">
            Questions about pricing or research access? Reach the team through the capstone
            adviser channel — this page doesn&rsquo;t process payments yet.
          </p>
        </main>
      </div>
    </div>
  );
}
