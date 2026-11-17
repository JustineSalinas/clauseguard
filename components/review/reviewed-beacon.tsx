"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Renders nothing. Tells the activity log that the user opened this
 * contract's finished review. The server checks ownership and ignores repeat
 * opens within 30 minutes, so a refresh does not inflate the count.
 */
export function ReviewedBeacon({ documentId }: { documentId: string }) {
  const recordReview = useMutation(api.auditLogs.recordReview);
  useEffect(() => {
    recordReview({ documentId: documentId as Id<"documents"> }).catch(() => {
      // Logging must never get in the way of reading the contract.
    });
  }, [documentId, recordReview]);
  return null;
}
