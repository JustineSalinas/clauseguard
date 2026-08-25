import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Example review — ClauseGuard",
  description:
    "A contract already reviewed by ClauseGuard, viewable without an account.",
};

export default function Sample() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-24">
      <p className="font-body text-[0.6875rem] tracking-[0.14em] text-ink-3 uppercase">
        Not built yet
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-balance">
        The example review lands here.
      </h1>
      <p className="mt-5 leading-relaxed text-ink-2">
        This page will show a full contract already reviewed, readable without an
        account: every clause marked on the original document, with confidence
        shown and the provisions cited. It is also the pre-scored corpus the
        defence demo runs from, so it never depends on a live model call.
      </p>
      <Link
        href="/"
        className="mt-8 self-start rounded border border-rule-2 px-5 py-3 font-medium transition-colors hover:bg-raised"
      >
        Back to the homepage
      </Link>
    </main>
  );
}
