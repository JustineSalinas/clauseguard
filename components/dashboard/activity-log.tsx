import Link from "next/link";
import {
  Upload,
  ScanSearch,
  AlertTriangle,
  Eye,
  RotateCcw,
  XCircle,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

type Summary = {
  uploaded: number;
  analyzed: number;
  contractsWithFlags: number;
  flaggedClauses: number;
  needsReviewClauses: number;
  reviewed: number;
  failed: number;
};

type Event = {
  _id: string;
  event: "uploaded" | "analyzed" | "failed" | "reviewed" | "retried";
  documentId: string;
  filename: string;
  detail?: { clauses?: number; flagged?: number; needsReview?: number; status?: string; stage?: string };
  createdAt: number;
};

const META: Record<Event["event"], { label: string; icon: LucideIcon; tone: string }> = {
  uploaded: { label: "Uploaded", icon: Upload, tone: "bg-[#fbeee4] text-[#b04000]" },
  analyzed: { label: "Analysed", icon: ScanSearch, tone: "bg-[#e7f5ef] text-[#0c8c5e]" },
  failed: { label: "Couldn’t be read", icon: XCircle, tone: "bg-[#fdecec] text-[#c0392b]" },
  reviewed: { label: "Opened for review", icon: Eye, tone: "bg-raised text-ink-2" },
  retried: { label: "Re-run", icon: RotateCcw, tone: "bg-raised text-ink-2" },
};

function Tile({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: number; hint?: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-rule bg-surface p-4 shadow-xs">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fbeee4] text-[#b04000]">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-2xl font-bold tracking-tight text-ink">{value}</div>
        <div className="text-[0.75rem] font-medium text-ink-3">{label}</div>
        {hint && <div className="text-[0.6875rem] text-ink-3">{hint}</div>}
      </div>
    </div>
  );
}

function plural(n: number, one: string, many = one + "s") {
  return `${n} ${n === 1 ? one : many}`;
}

function describe(e: Event): string | null {
  const d = e.detail;
  if (e.event === "analyzed" && d) {
    const parts = [
      plural(d.clauses ?? 0, "clause"),
      `${d.flagged ?? 0} flagged`,
      `${d.needsReview ?? 0} need your review`,
    ];
    return parts.join(" · ");
  }
  if (e.event === "failed" && d?.stage) return `Stopped at ${d.stage}`;
  return null;
}

const dateFmt = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Manila",
});

export function ActivityLog({ summary, events }: { summary: Summary; events: Event[] }) {
  return (
    <>
      <div className="border-b border-rule pb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Activity log
        </h1>
        <p className="mt-1 max-w-2xl text-[0.875rem] text-ink-2">
          Every contract you upload, analyse or open is recorded here, with the time. Only the file
          name and counts are kept, never the contract text. Deleting a contract also deletes its
          activity.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile icon={Upload} label="Contracts uploaded" value={summary.uploaded} />
        <Tile icon={ScanSearch} label="Contracts analysed" value={summary.analyzed} />
        <Tile
          icon={AlertTriangle}
          label="Contracts with flagged clauses"
          value={summary.contractsWithFlags}
          hint={`${plural(summary.flaggedClauses, "flagged clause")} in total`}
        />
        <Tile
          icon={UserCheck}
          label="Contracts reviewed"
          value={summary.reviewed}
          hint={`${plural(summary.needsReviewClauses, "clause")} routed to you to check`}
        />
      </div>

      <section className="mt-8" aria-labelledby="activity-heading">
        <h2 id="activity-heading" className="mb-3 font-display text-lg font-semibold tracking-tight text-ink">
          Recent activity
        </h2>

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-rule-2 bg-surface p-10 text-center">
            <p className="font-display text-lg font-semibold text-ink">Nothing here yet.</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">
              Upload your first contract and each step will show up here.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-[#b04000] px-4 text-sm font-semibold text-white hover:bg-[#8f3400]"
            >
              Upload a contract
            </Link>
          </div>
        ) : (
          <ol className="divide-y divide-rule overflow-hidden rounded-xl border border-rule bg-surface shadow-xs">
            {events.map((e) => {
              const m = META[e.event];
              const note = describe(e);
              return (
                <li key={e._id} className="flex items-start gap-3 p-3.5 sm:items-center sm:gap-4 sm:p-4">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${m.tone}`}>
                    <m.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8125rem] font-semibold text-ink">
                      {m.label}
                      <span className="font-normal text-ink-3"> · </span>
                      <span className="break-all font-medium text-ink-2 sm:break-normal sm:[overflow-wrap:anywhere]">
                        {e.filename}
                      </span>
                    </p>
                    {note && <p className="mt-0.5 text-[0.75rem] text-ink-3">{note}</p>}
                  </div>
                  <time
                    dateTime={new Date(e.createdAt).toISOString()}
                    className="shrink-0 text-right text-[0.6875rem] leading-snug text-ink-3 sm:text-[0.75rem]"
                  >
                    {dateFmt.format(e.createdAt)}
                  </time>
                </li>
              );
            })}
          </ol>
        )}
        {events.length >= 200 && (
          <p className="mt-2 text-[0.75rem] text-ink-3">Showing the latest 200 events.</p>
        )}
      </section>
    </>
  );
}
