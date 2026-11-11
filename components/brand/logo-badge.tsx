"use client";

import React from "react";

/**
 * ClauseGuard Brand Mark: lucide's own "shield" outline (node_modules/
 * lucide-react/dist/esm/icons/shield.mjs), filled solid copper, holding a
 * simplified scale-of-justice drawn in the same stroke language lucide
 * uses elsewhere in this app (round caps/joins, one weight) -- not the
 * old filled gradient + separate pillar + triangular trays, which read as
 * three different icon styles fighting inside one badge.
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

        {/* Scale of justice, drawn at lucide's own stroke weight/caps, scaled
            down and centered inside the shield's interior. */}
        <g
          transform="translate(12 12.8) scale(0.46) translate(-12 -12)"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v18" />
          <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1" />
          <path d="m5 8 3 8a5 5 0 0 1-6 0z" />
          <path d="m19 8 3 8a5 5 0 0 1-6 0z" />
          <path d="M7 21h10" />
        </g>
      </svg>
    </span>
  );
}
