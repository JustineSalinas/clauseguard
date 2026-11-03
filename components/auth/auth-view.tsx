"use client";

import { InteractiveAuthPanel } from "@/components/auth/interactive-auth-panel";

interface AuthViewProps {
  initialMode: "signin" | "signup";
  next?: string;
  error?: string;
}

export function AuthView({ initialMode, next, error }: AuthViewProps) {
  return (
    <div className="min-h-screen w-full bg-[#fafbfc] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-[#08090a]">
      <InteractiveAuthPanel initialMode={initialMode} next={next} errorQuery={error} />
    </div>
  );
}
