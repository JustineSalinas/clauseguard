"use client";

import { useSyncExternalStore } from "react";
import { ReactLenis } from "lenis/react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getSnapshot() {
  return !window.matchMedia(QUERY).matches;
}

// No window during SSR. Server always renders plain children, so the client's
// first paint matches it before hydration -- nothing to reconcile once the
// real value is read.
function getServerSnapshot() {
  return false;
}

/**
 * Site-wide smooth scroll, off by default. Lenis does not respect
 * prefers-reduced-motion on its own, and skipping that check would override a
 * setting some visitors rely on for real reasons -- vestibular disorders,
 * motion sickness -- not just taste.
 *
 * useSyncExternalStore rather than useEffect+useState: this is exactly what
 * it exists for, subscribing to an external browser API. It also means no
 * extra render after mount to swap the state in.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!enabled) return <>{children}</>;

  return <ReactLenis root>{children}</ReactLenis>;
}
