import React from "react";
import Image from "next/image";

export function CloudHeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Base deep atmospheric sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% -10%, #0c4333 0%, #07261d 45%, #051612 100%)",
        }}
      />

      {/* The Signature Painterly Cloud Artwork (ClauseGuard Sanctuary of Law in the Clouds) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-85">
        <Image
          src="/images/clauseguard-hero-clouds.jpg"
          alt="Atmospheric cumulus clouds landscape with classical sanctuary of legal protection"
          fill
          priority
          className="object-cover object-center mix-blend-screen scale-105"
        />
      </div>

      {/* Luminous emerald auroral bloom overlay */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] opacity-40 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #17835b 0%, #0a4f36 60%, transparent 85%)",
        }}
      />

      {/* Delicate glass desk coordinate hairline grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "-1px -1px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 80%)",
        }}
      />

      {/* Bottom fade into pure Paper White canvas below the hero fold */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent via-[#ffffff]/80 to-white" />
    </div>
  );
}

