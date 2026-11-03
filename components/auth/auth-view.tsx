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
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
        {/* Left Half: Minimalist System Design Pipeline for Non-Tech Users */}
        <div className="hidden lg:col-span-7 lg:block xl:col-span-7 border-r border-[#e2e4e8] bg-[#fafbfc]">
          <PipelineShowcase />
        </div>

        {/* Right Half: Clean Minimalist Auth Panel (Light Mode, No Sample Button) */}
        <div className="col-span-1 lg:col-span-5 xl:col-span-5 flex items-center justify-center bg-white">
          <InteractiveAuthPanel initialMode={initialMode} next={next} errorQuery={error} />
        </div>
      </div>
    </div>
  );
}
