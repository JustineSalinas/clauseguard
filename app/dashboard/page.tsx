import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import type { DocumentStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Your contracts — ClauseGuard" };

type DocumentRow = {
  id: string;
  filename: string;
  contract_type: string | null;
  status: DocumentStatus;
  page_count: number | null;
  created_at: string;
};

const STATUS_COPY: Record<DocumentStatus, string> = {
  uploaded: "Queued",
  extracting: "Reading the page",
  extracted: "Read",
  segmenting: "Finding clauses",
  segmented: "Clauses found",
  scoring: "Checking clauses",
  partial: "Partly checked",
  complete: "Reviewed",
  failed: "Couldn't be read",
};

function StatusPill({ status }: { status: DocumentStatus }) {
  const tone =
    status === "complete"
      ? "bg-clear-wash text-clear"
      : status === "failed"
        ? "bg-flag-wash text-flag"
        : status === "partial"
          ? "bg-caution-wash text-caution"
          : "bg-raised text-ink-2";

  return (
    <span
      className={`inline-flex rounded-sm px-2 py-1 font-body text-[0.6875rem] font-semibold tracking-[0.08em] uppercase ${tone}`}
    >
      {STATUS_COPY[status]}
    </span>
  );
}

export default async function Dashboard() {
  const supabase = await createClient();

  // getClaims validates the JWT signature against the project's published keys.
  // getSession reads storage and is not trustworthy on the server.
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/login?next=/dashboard");

  const email =
    typeof claimsData.claims.email === "string"
      ? claimsData.claims.email
      : "your account";

  // RLS scopes this to the signed-in owner. No owner_id filter is written here
  // on purpose: if the filter is the only thing protecting the row, one
  // forgotten .eq() leaks every contract in the table.
  const { data: documents, error } = await supabase
    .from("documents")
    .select("id, filename, contract_type, status, page_count, created_at")
    .order("created_at", { ascending: false })
    .returns<DocumentRow[]>();

  const rows = documents ?? [];

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-tight"
          >
            Clause<span className="text-flag">Guard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-[0.875rem] text-ink-2 sm:block">
              {email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="lg">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            Your contracts
          </h1>
          <Button disabled size="hero" variant="flag">
            Upload a contract
          </Button>
        </div>

        {error ? (
          <div className="mt-8 rounded-sm border border-rule border-l-2 border-l-caution bg-surface p-5">
            <p className="font-semibold">Your contracts didn&rsquo;t load.</p>
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
              The database isn&rsquo;t reachable, or the schema migration
              hasn&rsquo;t been applied to this project yet. Run the migration
              in <code className="text-[0.875rem]">supabase/migrations</code>{" "}
              and reload.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-8 rounded-sm border border-dashed border-rule-2 bg-surface p-12 text-center">
            <p className="font-display text-xl font-semibold">
              Nothing here yet.
            </p>
            <p className="mx-auto mt-2 max-w-md leading-relaxed text-ink-2">
              Upload a contract and ClauseGuard will mark the clauses that shift
              risk onto you. Upload isn&rsquo;t wired up yet, but you can read a
              finished review now.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="hero" variant="outline">
                <Link href="/sample">See an example review</Link>
              </Button>
            </div>
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {rows.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/dashboard/${d.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-rule bg-surface p-5 transition-colors hover:bg-raised"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{d.filename}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-3">
                      {d.contract_type ?? "Contract"}
                      {d.page_count ? ` · ${d.page_count} pages` : ""} ·{" "}
                      {new Date(d.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusPill status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-[0.8125rem] text-ink-3">
          Signed in as {email}. Contracts you upload are private to this
          account.
        </p>
      </main>
    </div>
  );
}
