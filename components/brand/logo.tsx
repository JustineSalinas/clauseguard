import React from "react";
import Link from "next/link";
import { ShieldMark } from "@/components/brand/shield-mark";

interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PX = { sm: 24, md: 28, lg: 32 };

/**
 * ClauseGuard brand mark: the hand-drawn shield/scale/book, not a plain
 * monogram. See shield-mark.tsx for why the "C" stays reserved for the
 * favicon instead.
 */
export function LogoMark({ size = "md", className = "" }: LogoMarkProps) {
  return <ShieldMark size={PX[size]} className={className} />;
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
        <span className="font-display text-[1.125rem] font-semibold tracking-[-0.01em] text-ink">
          Clause<span className="text-brand">Guard</span>
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
