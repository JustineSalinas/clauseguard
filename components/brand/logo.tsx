import React from "react";
import Link from "next/link";
import { LogoBadge } from "@/components/brand/logo-badge";

interface LogoMarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const PX = { sm: 26, md: 30, lg: 36 };

/**
 * ClauseGuard brand mark for the nav bar and footer -- the only two places
 * this renders. The detailed shield/scale/book (shield-mark.tsx) needs
 * ~40px and up before it reads as a shape rather than texture; every real
 * usage here is smaller than that, so it uses the same solid copper badge
 * as the browser tab icon instead. One mark, used everywhere it actually
 * appears, rather than two different unfinished-looking attempts.
 */
export function LogoMark({ size = "md", className = "" }: LogoMarkProps) {
  return <LogoBadge size={PX[size]} className={className} />;
}

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showWordmark?: boolean;
  className?: string;
}

const WORDMARK_TEXT = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

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
        <span className={`font-display ${WORDMARK_TEXT[size]} font-semibold tracking-[-0.01em] text-ink`}>
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
