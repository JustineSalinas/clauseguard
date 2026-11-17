import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { getSample } from "@/lib/fixtures/sample-contracts";
import { SamplePicker } from "@/components/review/sample-picker";
import { SampleMethodology } from "@/components/review/sample-methodology";
import { ReviewView } from "@/components/review/review-view";
import { ContractHealthCard } from "@/components/review/contract-health-card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { PublicMobileNav } from "@/components/brand/public-mobile-nav";

export const metadata: Metadata = {
  title: "Example review | ClauseGuard",
  description:
    "A freelance design agreement reviewed by ClauseGuard, readable without an account.",
};

export default async function Sample({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  if (await isAuthenticatedNextjs()) {
    redirect(c ? `/dashboard/sample?c=${encodeURIComponent(c)}` : "/dashboard/sample");
  }

  const sample = getSample(c);
  const doc = sample.doc;

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <header className="border-b border-rule bg-surface sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-2">
            <Button asChild size="default" variant="brand" className="hidden sm:inline-flex">
              <Link href="/signup">Review your own contract</Link>
            </Button>
            <PublicMobileNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fbeee4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#b04000] border border-[#e8c6a8]">
            <span className="size-1.5 rounded-full bg-[#b04000]" />
            Live Sample Review &middot; No Account Required
          </div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink text-balance">
            {sample.title}, marked up.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-ink-2 leading-relaxed">
            {sample.summary} Every verdict is shown openly, including the ones we would not call,
            because a clause we skipped is something you still need to know about.
          </p>
        </div>

        <div className="mt-6">
          <SamplePicker basePath="/sample" activeSlug={sample.slug} />
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <ContractHealthCard clauses={doc.clauses} />
          <ReviewView doc={doc} />
        </div>

        <div className="mt-12">
          <SampleMethodology doc={doc} />
        </div>
      </main>
    </div>
  );
}
