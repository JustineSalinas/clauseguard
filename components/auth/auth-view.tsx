"use client";

import { PipelineShowcase } from "@/components/auth/pipeline-showcase";
import { InteractiveAuthPanel } from "@/components/auth/interactive-auth-panel";

interface AuthViewProps {
  initialMode: "signin" | "signup";
  next?: string;
  error?: string;
}

export function AuthView({ initialMode, next, error }: AuthViewProps) {
  return (
    <div className="min-h-screen w-full bg-white text-[#08090a]">
      {/* Exact 50/50 split on desktop */}
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left 50%: Clean Minimalist Pipeline Architecture */}
        <div className="hidden lg:flex lg:flex-col border-r border-[#e5e7eb] bg-[#fafbfc]">
          <PipelineShowcase />
        </div>

        {/* Right 50%: Clean Minimalist Auth Panel */}
        <div className="flex flex-col items-center justify-center bg-white">
          <InteractiveAuthPanel initialMode={initialMode} next={next} errorQuery={error} />
        </div>
      </div>
    </div>
  );
}
