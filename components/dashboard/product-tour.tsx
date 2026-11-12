"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react";

/**
 * Plain-language walkthrough of every dashboard feature, for demos. Steps
 * reference `data-tour="<id>"` markers sprinkled across the sidebar and the
 * main dashboard page. Deliberately not a library (react-joyride, driver.js,
 * etc.) -- the CSP-equivalent CDN allowlist for this app doesn't need one for
 * fourteen fixed steps, and a spotlight + tooltip is ~150 lines of plain
 * React.
 */
const TOUR_STEPS = [
  {
    target: "logo",
    title: "Welcome to ClauseGuard",
    body: "Think of this as a second pair of eyes before you sign anything. Upload a contract and it reads every clause the way a lawyer would -- just much faster.",
  },
  {
    target: "nav-contracts",
    title: "Your Contracts",
    body: "Every agreement you've uploaded lives here, with its review status. This is your home base -- you'll land here every time you sign in.",
  },
  {
    target: "nav-sample",
    title: "Sample Review",
    body: "A ready-made example contract, already fully checked. Perfect for a demo when you don't want to wait for a real upload to finish.",
  },
  {
    target: "nav-corpus",
    title: "Legal Corpus",
    body: "The actual Philippine Civil Code and Labor Code articles ClauseGuard checks contracts against -- 320 real statutory provisions you can search and read yourself.",
  },
  {
    target: "nav-playbook",
    title: "Pushback Playbook",
    body: "Ready-to-send wording for pushing back on the riskiest clause types. If a clause gets flagged, you'll know exactly what to write back to the other party.",
  },
  {
    target: "nav-billing",
    title: "Plan & Billing",
    body: "See what plan you're on and change it any time.",
  },
  {
    target: "nav-settings",
    title: "Settings",
    body: "Your account details and preferences live here.",
  },
  {
    target: "corpus-badge",
    title: "The Law Library Is Live",
    body: "This badge means the statutory database is loaded and ready -- 320 real articles ClauseGuard can cite the moment it flags something risky in your contract.",
  },
  {
    target: "profile",
    title: "That's You",
    body: "Your signed-in account. Click here any time to manage your profile or sign out.",
  },
  {
    target: "stats",
    title: "Your Numbers, At a Glance",
    body: "How many contracts you've uploaded, how many are still being checked, how many need your attention right now, and how many are fully reviewed and clear.",
  },
  {
    target: "quick-tools",
    title: "Three One-Click Shortcuts",
    body: "Jump straight to the law library, the pushback playbook, or a finished sample review -- no need to dig through menus.",
  },
  {
    target: "upload",
    title: "This Is Where It Starts",
    body: "Drop in a PDF or even a photo of a contract. ClauseGuard reads the text, splits it into individual clauses, and checks each one on its own -- so nothing risky hides between paragraphs.",
  },
  {
    target: "methodology",
    title: "What Happens Behind the Scenes",
    body: "Three steps, every time: (1) every clause is pulled out individually, (2) each one is checked against real Philippine law, (3) you get an honest, confidence-scored risk rating -- never vague legal jargon, and never a guess dressed up as certainty.",
  },
  {
    target: "contracts-list",
    title: "Your Review History",
    body: "Every contract you've checked shows up here, color-coded by risk. Click any one to see exactly which clauses are dangerous, why, and what to say instead.",
  },
] as const;

const AUTOSTART_KEY = "clauseguard:tour-autostart";

export function startTourFromAnywhere(router: ReturnType<typeof useRouter>, pathname: string) {
  if (pathname !== "/dashboard") {
    sessionStorage.setItem(AUTOSTART_KEY, "1");
    router.push("/dashboard");
    return;
  }
  window.dispatchEvent(new CustomEvent("clauseguard:start-tour"));
}

export function TourButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <button
      type="button"
      onClick={() => startTourFromAnywhere(router, pathname)}
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#e8c6a8] bg-[#fbeee4] px-3 py-1.5 text-[0.75rem] font-semibold text-[#b04000] shadow-2xs transition-colors hover:bg-[#b04000] hover:text-white ${className}`}
    >
      <Compass className="size-3.5" />
      Take the Tour
    </button>
  );
}

type Rect = { top: number; left: number; width: number; height: number };

function measure(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function ProductTour() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const frame = useRef<number | null>(null);

  const step = TOUR_STEPS[stepIndex];

  const recompute = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      // Wait a tick for smooth-scroll to settle before measuring.
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setRect(measure(el));
      });
    } else {
      setRect(null);
    }
  }, [step]);

  useEffect(() => {
    function onStart() {
      setStepIndex(0);
      setOpen(true);
    }
    window.addEventListener("clauseguard:start-tour", onStart);

    if (sessionStorage.getItem(AUTOSTART_KEY) === "1") {
      sessionStorage.removeItem(AUTOSTART_KEY);
      setStepIndex(0);
      setOpen(true);
    }

    return () => window.removeEventListener("clauseguard:start-tour", onStart);
  }, []);

  useEffect(() => {
    if (!open) return;
    recompute();
    window.addEventListener("resize", recompute);
    window.addEventListener("scroll", recompute, true);
    return () => {
      window.removeEventListener("resize", recompute);
      window.removeEventListener("scroll", recompute, true);
    };
  }, [open, recompute]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stepIndex]);

  function next() {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      setOpen(false);
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  if (!open) return null;

  const pad = 8;
  const spotlight = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  // Position tooltip below the target if there's room, else above.
  const tooltipTop = spotlight
    ? spotlight.top + spotlight.height + 16 + window.scrollY < window.innerHeight + window.scrollY - 160
      ? spotlight.top + spotlight.height + 16
      : Math.max(16, spotlight.top - 16 - 220)
    : window.innerHeight / 2 - 100;
  const tooltipLeft = spotlight
    ? Math.min(Math.max(16, spotlight.left), window.innerWidth - 376)
    : window.innerWidth / 2 - 180;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="ClauseGuard product tour">
      {/* Dimmed backdrop with a spotlight cutout around the target */}
      <div
        className="absolute inset-0 transition-[box-shadow] duration-300"
        style={
          spotlight
            ? {
                position: "fixed",
                top: spotlight.top,
                left: spotlight.left,
                width: spotlight.width,
                height: spotlight.height,
                borderRadius: 12,
                boxShadow: "0 0 0 9999px rgba(8,9,10,0.6)",
                border: "2px solid #b04000",
                pointerEvents: "none",
              }
            : { position: "fixed", inset: 0, background: "rgba(8,9,10,0.6)" }
        }
      />

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="fixed inset-0 cursor-default"
        aria-label="Close tour"
        style={{ background: "transparent" }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="fixed w-[360px] max-w-[calc(100vw-32px)] rounded-xl border border-rule bg-surface p-5 shadow-lg"
          style={{ top: tooltipTop, left: tooltipLeft }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[0.6875rem] font-semibold text-[#b04000]">
              <Compass className="size-3.5" />
              {stepIndex + 1} / {TOUR_STEPS.length}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-ink-3 hover:text-ink"
              aria-label="Close tour"
            >
              <X className="size-4" />
            </button>
          </div>

          <h3 className="font-display mt-2 text-base font-bold text-ink">{step.title}</h3>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">{step.body}</p>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={back}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[0.75rem] font-medium text-ink-2 transition-colors hover:bg-raised disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowLeft className="size-3.5" />
              Back
            </button>

            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`size-1.5 rounded-full transition-colors ${
                    i === stepIndex ? "bg-[#b04000]" : "bg-rule"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1 rounded-md bg-[#b04000] px-3 py-1.5 text-[0.75rem] font-semibold text-white transition-colors hover:bg-[#943501]"
            >
              {stepIndex === TOUR_STEPS.length - 1 ? "Done" : "Next"}
              {stepIndex < TOUR_STEPS.length - 1 && <ArrowRight className="size-3.5" />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
