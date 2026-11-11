"use client";

import React from "react";

/**
 * ClauseGuard Brand Mark: a solid copper shield with a single checkmark --
 * the same shield silhouette as the favicon (app/icon.tsx), so the mark
 * reads as one shape across every size instead of two different logos.
 * No gradient, no secondary motif (scale/pillar) competing with the
 * checkmark -- restraint is what keeps it legible at 16-48px.
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
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ClauseGuard"
        className="transition-transform duration-200 group-hover:scale-105"
      >
        {/* Shield silhouette -- same proportions as app/icon.tsx's favicon path */}
        <path
          d="M18 3L29.5 7.4C30.4 7.7 31 8.6 31 9.6V17.5C31 24.8 25.6 30.8 18.5 32.7C18.2 32.8 17.8 32.8 17.5 32.7C10.4 30.8 5 24.8 5 17.5V9.6C5 8.6 5.6 7.7 6.5 7.4L18 3Z"
          fill="#b04000"
        />

        {/* Checkmark -- the one motif, large enough to hold at favicon size */}
        <path
          d="M11.5 18.2L16 22.7L25 12.8"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
