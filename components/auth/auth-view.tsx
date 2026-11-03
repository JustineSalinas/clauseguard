"use client";

import { InteractiveHeroShowcase } from "@/components/auth/interactive-hero-showcase";
import { InteractiveAuthPanel } from "@/components/auth/interactive-auth-panel";

interface AuthViewProps {
  initialMode: "signin" | "signup";
  next?: string;
  error?: string;
}

export function AuthView({ initialMode, next, error }: AuthViewProps) {
  return (
    <div className="relative min-h-screen w-full bg-[#07080a] text-white">
      {/* Signature Atmospheric Directional Light Beam from Top-Right (preserves ClauseGuard depth) */}
      <div
        className="pointer-events-none absolute -top-40 right-0 h-[800px] w-[800px] opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(255, 255, 255, 0.4) 0%, rgba(176, 64, 0, 0.25) 40%, transparent 75%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[600px] w-[600px] opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(176, 64, 0, 0.45) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-12">
        {/* Left Half: Brand Hero & Live Interactive Contract Grounding Showcase */}
        <div className="hidden lg:col-span-7 lg:block xl:col-span-7 border-r border-white/[0.08] bg-[#07080b]/90 backdrop-blur-md">
          <InteractiveHeroShowcase />
        </div>

        {/* Right Half: Interactive Auth Form Panel */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-5 flex items-center justify-center bg-[#090b0e]/95 backdrop-blur-2xl">
          <InteractiveAuthPanel initialMode={initialMode} next={next} errorQuery={error} />
        </div>
      </div>
    </div>
  );
}

