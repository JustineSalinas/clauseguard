import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-24">
      <p className="font-body text-[0.6875rem] tracking-[0.14em] text-ink-3 uppercase">
        404
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-balance">
        Nothing&rsquo;s here.
      </h1>
      <p className="mt-4 leading-relaxed text-ink-2">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or it moved. It
        wasn&rsquo;t deleted quietly &mdash; there&rsquo;s just nothing at this
        address.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="hero">
          <Link href="/">Back to the homepage</Link>
        </Button>
        <Button asChild variant="outline" size="hero">
          <Link href="/sample">See an example review</Link>
        </Button>
      </div>
    </main>
  );
}
