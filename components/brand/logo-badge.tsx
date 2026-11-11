"use client";

import React from "react";

/**
 * ClauseGuard Brand Mark: lucide's own "shield" outline (node_modules/
 * lucide-react/dist/esm/icons/shield.mjs), filled solid copper, holding
 * the section sign (§) -- the universal mark for a statutory provision,
 * which is literally what this product grounds every risk flag in --
 * instead of the scale-of-justice every other legal-adjacent product
 * already uses. Rendered as live <text>, not a hand-drawn path: at ~28px
 * a hand-built glyph's counters anti-alias shut and lose legibility
 * (tried with a pilcrow first, rejected) -- the browser's own font
 * hinting at small sizes beats approximating glyph geometry by hand.
 */
export function LogoBadge({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center relative select-none ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ClauseGuard"
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* lucide "shield" path, used as a solid fill rather than a stroke outline */}
        <path
          d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
          fill="#b04000"
        />

        <text
          x="12"
          y="13.4"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="15"
          fill="#ffffff"
        >
          &#167;
        </text>
      </svg>
    </span>
  );
}
