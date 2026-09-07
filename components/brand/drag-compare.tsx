"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

/**
 * Generic drag-to-reveal comparison: a vertical divider that clips `after`
 * over `before`. Used by the hero's Marked-Up Sample Inspector (real sample
 * clauses, driven by parent state) and can be reused anywhere a raw/audited
 * pair needs the same gesture.
 *
 * GSAP is used for exactly one thing here: the eased snap toward the nearer
 * side after a drag release, so the comparison always ends fully readable on
 * one side rather than resting mid-drag. No bounce -- this product's
 * register is formal, not playful.
 */
export function DragCompare({
  before,
  after,
  leftLabel = "Before",
  rightLabel = "After",
  initialPercent = 50,
  onPercentChange,
  className = "",
}: {
  before: ReactNode;
  after: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  initialPercent?: number;
  onPercentChange?: (percent: number) => void;
  className?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const afterMaskRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const onPercentChangeRef = useRef(onPercentChange);
  onPercentChangeRef.current = onPercentChange;

  useEffect(() => {
    const rail = railRef.current;
    const afterMask = afterMaskRef.current;
    const handle = handleRef.current;
    const cursor = cursorRef.current;
    if (!rail || !afterMask || !handle || !cursor) return;

    let dragging = false;
    let pendingClientX: number | null = null;
    let rafId = 0;

    // A quiet cue that follows the pointer anywhere over the rail, so the
    // drag affordance reads before anyone touches the handle itself. Short
    // GSAP quickTo tweens (x/y) rather than setting style directly, so the
    // follow has a hint of smoothing rather than snapping frame-to-frame --
    // but short enough (0.12s) that it reads as responsive, not laggy.
    const followX = gsap.quickTo(cursor, "x", { duration: 0.12, ease: "power2.out" });
    const followY = gsap.quickTo(cursor, "y", { duration: 0.12, ease: "power2.out" });
    let hasEntered = false;

    // A slow, idle breathing scale on the handle itself -- invites the first
    // touch without being a distraction. Stops for good the moment someone
    // actually drags; a hint that keeps insisting after being taken reads as
    // nagging, not helpful.
    const idlePulse = gsap.to(handle, {
      scale: 1.06,
      duration: 1.1,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    });

    const setPercent = (percent: number) => {
      const clamped = Math.min(96, Math.max(4, percent));
      afterMask.style.clipPath = `inset(0 0 0 ${clamped}%)`;
      handle.style.left = `${clamped}%`;
      onPercentChangeRef.current?.(clamped);
    };

    setPercent(initialPercent);

    const percentFromClientX = (clientX: number) => {
      const rect = rail.getBoundingClientRect();
      return ((clientX - rect.left) / rect.width) * 100;
    };

    // Pointer devices (especially trackpads and high-poll-rate mice) can
    // fire pointermove far more often than the screen repaints. Writing
    // clip-path synchronously on every one of those events forces a repaint
    // of the (text-heavy) masked layer more often than the display can show
    // it -- that's the stutter. Instead, stash the latest x and let one rAF
    // per frame apply it, so the mask updates at most once per paint.
    const applyPending = () => {
      rafId = 0;
      if (pendingClientX === null) return;
      setPercent(percentFromClientX(pendingClientX));
      pendingClientX = null;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      pendingClientX = e.clientX;
      if (!rafId) rafId = requestAnimationFrame(applyPending);
    };

    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (pendingClientX !== null) {
        setPercent(percentFromClientX(pendingClientX));
        pendingClientX = null;
      }
      const current = parseFloat(handle.style.left || String(initialPercent));
      const target = current < 50 ? 22 : 78;
      const state = { p: current };
      gsap.to(state, {
        p: target,
        duration: 0.5,
        ease: "power3.out",
        onUpdate: () => setPercent(state.p),
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      idlePulse.kill();
      gsap.set(handle, { scale: 1 });
      gsap.to(cursor, { opacity: 0, duration: 0.15 });
      setPercent(percentFromClientX(e.clientX));
    };

    const onRailPointerMove = (e: PointerEvent) => {
      const rect = rail.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (!hasEntered) {
        // First position after entering: jump straight there. Easing a
        // 200px catch-up on the very first frame is what reads as "not
        // responding" -- only frame-to-frame movement should ease.
        gsap.set(cursor, { x, y });
        hasEntered = true;
      } else {
        followX(x);
        followY(y);
      }
    };
    const onRailEnter = () => {
      if (dragging) return;
      gsap.to(cursor, { opacity: 1, duration: 0.12 });
    };
    const onRailLeave = () => {
      hasEntered = false;
      gsap.to(cursor, { opacity: 0, duration: 0.15 });
    };

    handle.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    const onRailDown = (e: PointerEvent) => {
      // Skip if the press landed anywhere inside the handle (the grip
      // circle, its icon) -- handle.contains, not e.target === handle,
      // because the actual event target is almost always a descendant
      // (the svg or its path), never the handle div itself. Getting this
      // wrong makes every press on the visible handle register as a click
      // on empty track: it jumps and immediately snap-releases instead of
      // starting a drag.
      if (handle.contains(e.target as Node)) return;
      onPointerDown(e);
      onPointerUp();
    };
    rail.addEventListener("pointerdown", onRailDown);
    rail.addEventListener("pointermove", onRailPointerMove);
    rail.addEventListener("pointerenter", onRailEnter);
    rail.addEventListener("pointerleave", onRailLeave);

    return () => {
      idlePulse.kill();
      if (rafId) cancelAnimationFrame(rafId);
      handle.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      rail.removeEventListener("pointerdown", onRailDown);
      rail.removeEventListener("pointermove", onRailPointerMove);
      rail.removeEventListener("pointerenter", onRailEnter);
      rail.removeEventListener("pointerleave", onRailLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={railRef}
      className={`relative select-none overflow-hidden [@media(pointer:fine)]:cursor-none ${className}`}
      style={{ touchAction: "none" }}
    >
      <div className="pointer-events-none absolute left-3 top-3 z-10 font-mono text-[0.625rem] font-medium uppercase tracking-[0.1em] text-ink-3">
        {leftLabel}
      </div>
      <div className="pointer-events-none absolute right-3 top-3 z-10 font-mono text-[0.625rem] font-medium uppercase tracking-[0.1em] text-ink-3">
        {rightLabel}
      </div>

      {before}

      <div
        ref={afterMaskRef}
        className="pointer-events-none absolute inset-0 border-l border-rule-2 bg-inherit"
        style={{ clipPath: `inset(0 0 0 ${initialPercent}%)`, willChange: "clip-path" }}
      >
        {after}
      </div>

      <div
        ref={handleRef}
        className="absolute top-0 z-20 flex h-full w-8 -translate-x-1/2 cursor-ew-resize items-center justify-center"
        style={{ left: `${initialPercent}%`, touchAction: "none" }}
      >
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink/15" />
        <div className="flex size-8 items-center justify-center rounded-full border border-rule-2 bg-paper text-ink-2 shadow-[0_2px_6px_rgba(8,9,10,0.08)]">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 2L1 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 2L13 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Custom follow-cursor: a quiet "drag to compare" cue that tracks the
          pointer anywhere over the rail, not just on the handle. Hidden by
          default (opacity 0, faded in on hover) and never intercepts clicks. */}
      <div
        ref={cursorRef}
        className="pointer-events-none absolute top-0 left-0 z-30 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-rule-2 bg-ink px-3 py-1.5 opacity-0 shadow-[0_4px_12px_rgba(8,9,10,0.18)]"
      >
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M5 2L1 7L5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.08em] text-white">
          Drag to compare
        </span>
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L13 7L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
