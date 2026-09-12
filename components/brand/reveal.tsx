"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Generic scroll-triggered fade + rise, used to bring the landing page's
 * static below-the-fold sections to life without touching the hero (which
 * already has its own entrance treatment). Fires once per element -- a
 * callout that re-animates every time you scroll past it reads as a glitch,
 * not polish, same rule the hero's own reveal follows.
 */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el) return;

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      },
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
}
