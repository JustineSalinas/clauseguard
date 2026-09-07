import React from "react";
import Image from "next/image";

export function CloudHeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Base deep atmospheric sky gradient -- warm espresso-copper, not the
          earlier emerald: this backdrop sits directly behind the brand mark
          and CTA, so its ambient colour should read as the same family as
          --color-brand, not fight it. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% -10%, #3d2210 0%, #221207 45%, #130a05 100%)",
        }}
      />

      {/* The Signature Painterly Cloud Artwork (ClauseGuard Sanctuary of Law in the Clouds).
          Opacity dropped from 0.85 -- mix-blend-screen only ever lightens, so at
          full strength the photo's brightest cloud highlights were blowing out
          to near-white, which put white headline text on a ~1:1 contrast
          background in places. Measured, not eyeballed: sampled the rendered
          hero and found a spot at literal rgb(255,255,255) under the H1. */}
      <div className="absolute inset-0 flex items-center justify-center opacity-55">
        <Image
          src="/images/clauseguard-hero-clouds.jpg"
          alt="Atmospheric cumulus clouds landscape with classical sanctuary of legal protection"
          fill
          priority
          className="object-cover object-center mix-blend-screen scale-105"
        />
      </div>

      {/* No colour wash on the photo layer at all, on purpose: clouds are
          white, and both the flat "color" tint (v1) and the low-opacity
          "overlay" tint (v2) still stained them orange because they touch
          every pixel including the bright cloud tops. Copper now lives only
          in the base gradient and aurora glow below/around the clouds -- the
          clouds themselves render at their real photographed colour. */}

      {/* Legibility scrim: a plain (non-blending) dark wash, heaviest where the
          headline/subheading/CTA actually sit, so text contrast holds
          regardless of how bright the cloud underneath happens to be at that
          point -- the fix that actually matters, the two layers above only
          change hue and intensity, not the worst-case contrast floor. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 30%, rgba(9,4,2,0.55) 0%, rgba(9,4,2,0.4) 55%, rgba(9,4,2,0.25) 100%)",
        }}
      />

      {/* Luminous copper auroral bloom overlay */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] opacity-25 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, #c2600a 0%, #7a3a08 60%, transparent 85%)",
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

