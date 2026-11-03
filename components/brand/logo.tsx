import React from "react";
import Link from "next/link";
import { LogoBadge } from "@/components/brand/logo-badge";

interface LogoMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const PX = { sm: 26, md: 32, lg: 38, xl: 48 };

export function LogoMark({ size = "md", className = "" }: LogoMarkProps) {
  return <LogoBadge size={PX[size]} className={className} />;
}

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
  theme?: "light" | "dark";
}

const WORDMARK_TEXT = {
  sm: "text-[15px]",
  md: "text-[17px]",
  lg: "text-xl",
  xl: "text-2xl",
};

export function Logo({
  size = "md",
  href = "/",
  showWordmark = true,
  showTagline = false,
  className = "",
  theme = "light",
}: LogoProps) {
  const isDark = theme === "dark";

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={`font-display ${WORDMARK_TEXT[size]} font-bold tracking-tight leading-none ${
              isDark ? "text-white" : "text-[#08090a]"
            }`}
          >
            Clause<span className="text-[#b04000]">Guard</span>
          </span>
          {showTagline && (
            <span
              className={`text-[10px] uppercase font-mono tracking-[0.08em] mt-1 ${
                isDark ? "text-white/50" : "text-[#868c98]"
              }`}
            >
              Statutory Contract Review
            </span>
          )}
        </div>
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
