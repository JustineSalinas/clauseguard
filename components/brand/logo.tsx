import React from "react";
import Link from "next/link";

interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * ClauseGuard Brand Mark:
 * A green (#0c8c5e) squircle with white bold "C" in Inter sans-serif,
 * identical to the site's favicon and app icons.
 */
export function LogoMark({ size = "md", className = "" }: LogoMarkProps) {
  const sizeClasses = {
    sm: "size-6 rounded-[5px] text-xs font-bold",
    md: "size-7 rounded-[6px] text-sm font-bold",
    lg: "size-8 rounded-[8px] text-base font-bold",
  };

  return (
    <span
      className={`inline-flex items-center justify-center bg-[#0c8c5e] text-white font-sans select-none shadow-[0_1px_2px_rgba(12,140,94,0.15)] leading-none ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    >
      C
    </span>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showWordmark?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  href = "/",
  showWordmark = true,
  className = "",
}: LogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span className="font-sans text-[1.125rem] font-semibold tracking-[-0.01em] text-[#08090a]">
          Clause<span className="text-[#0c8c5e]">Guard</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
