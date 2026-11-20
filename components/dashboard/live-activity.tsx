"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";
import { ActivityLog } from "@/components/dashboard/activity-log";

/** Live subscription over the preloaded activity data, so deleting a contract
 *  (which removes its log rows) updates this page without a refresh. */
export function LiveActivity({
  summary,
  events,
}: {
  summary: Preloaded<typeof api.auditLogs.summaryMine>;
  events: Preloaded<typeof api.auditLogs.listMine>;
}) {
  return <ActivityLog summary={usePreloadedQuery(summary)} events={usePreloadedQuery(events)} />;
}
