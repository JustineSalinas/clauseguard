"use client";

import React from "react";

/**
 * ClauseGuard Brand Mark:
 * An authoritative, precision-crafted legal shield mark combining
 * protective geometry with an architectural justice pillar and balance scale beam.
 * Crafted in the signature ClauseGuard copper palette.
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
        <defs>
          <linearGradient id="cg-copper-grad" x1="4" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c44a05" />
            <stop offset="0.6" stopColor="#b04000" />
            <stop offset="1" stopColor="#872e00" />
          </linearGradient>
          <linearGradient id="cg-inner-sheen" x1="18" y1="4" x2="18" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Outer faceted shield container */}
        <path
          d="M18 3.2L29.5 7.6C30.4 7.9 31 8.8 31 9.8V17.5C31 24.8 25.6 30.8 18.5 32.7C18.2 32.8 17.8 32.8 17.5 32.7C10.4 30.8 5 24.8 5 17.5V9.8C5 8.8 5.6 7.9 6.5 7.6L18 3.2Z"
          fill="url(#cg-copper-grad)"
        />

        {/* Subtle inner shield contour for dimension */}
        <path
          d="M18 4.6L28.2 8.5C28.7 8.7 29 9.1 29 9.7V17C29 23.5 24.2 29 18 30.8C11.8 29 7 23.5 7 17V9.7C7 9.1 7.3 8.7 7.8 8.5L18 4.6Z"
          stroke="url(#cg-inner-sheen)"
          strokeWidth="0.8"
        />

        {/* Central Justice Pillar & Balance Motif */}
        {/* Horizontal balance bar */}
        <path
          d="M10.8 13.5H25.2"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Left balance tray */}
        <path
          d="M10 15L12 19H8.5L10 15Z"
          fill="#ffffff"
          opacity="0.9"
        />
        {/* Right balance tray */}
        <path
          d="M26 15L27.5 19H24L26 15Z"
          fill="#ffffff"
          opacity="0.9"
        />
        {/* Center column / protective guard */}
        <path
          d="M18 11V24.5"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Column capital & base */}
        <circle cx="18" cy="11.2" r="1.4" fill="#ffffff" />
        <path
          d="M15 24.5H21"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
