import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LiveActivity } from "@/components/dashboard/live-activity";

export const metadata: Metadata = {
  title: "Activity log | ClauseGuard",
  description: "A record of the contracts you uploaded, analysed, flagged and reviewed.",
};

export default async function ActivityPage() {
  if (!(await isAuthenticatedNextjs())) {
    redirect("/login?next=/dashboard/activity");
  }

  const token = await convexAuthNextjsToken();
  const [user, summary, rows] = await Promise.all([
    fetchQuery(api.users.me, {}, { token }),
    preloadQuery(api.auditLogs.summaryMine, {}, { token }),
    preloadQuery(api.auditLogs.listMine, {}, { token }),
  ]);
  const email = user?.email ?? "your account";

  return (
    <div className="min-h-screen bg-[#fafbfc] lg:flex">
      <Sidebar email={email} activeHref="/dashboard/activity" />
      <div className="flex-1">
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <LiveActivity summary={summary} events={rows} />
        </main>
      </div>
    </div>
  );
}
