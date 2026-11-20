import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { preloadQuery, preloadedQueryResult } from "convex/nextjs";
import { convexAuthNextjsToken, isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { LiveReview } from "@/components/review/live-review";

export const metadata: Metadata = { title: "Review" };

export default async function DocumentReview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isAuthenticatedNextjs())) {
    redirect(`/login?next=/dashboard/${id}`);
  }

  const token = await convexAuthNextjsToken();
  const documentId = id as Id<"documents">;

  const [doc, rows] = await Promise.all([
    preloadQuery(api.documents.get, { id: documentId }, { token }),
    preloadQuery(api.clauses.listScoresForDocument, { documentId }, { token }),
  ]);
  if (!preloadedQueryResult(doc)) redirect("/dashboard");

  return <LiveReview doc={doc} rows={rows} />;
}
