"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The review page is a server component that reads the document once, so it
 * never sees the pipeline advance on its own. While a document is still
 * processing, re-run the server render on an interval. The parent only mounts
 * this while the status is in flight, so polling stops by itself once the
 * document completes or fails.
 */
export function AutoRefresh({ intervalMs = 2000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
