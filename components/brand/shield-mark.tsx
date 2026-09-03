/**
 * The full ClauseGuard mark: shield, scale, open book. Flat, hand-drawn SVG
 * -- no gradients, no bevels, no photographed background. Intended for the
 * header lockup, hero, and print, at sizes roughly 40px and up. It is
 * deliberately not the favicon: a shield with a scale and a book reads as
 * texture, not a shape, once it is shrunk to a 16-32px browser tab. That job
 * stays with the plain "C" monogram in app/icon.tsx.
 *
 * Colour comes from CSS custom properties, not fixed hex, so the mark follows
 * the page's light/dark theme the same way every other token-driven element
 * on the site does. For a context that cannot read CSS variables at render
 * time -- app/opengraph-image.tsx, app/apple-icon.tsx, anything built on
 * next/og's ImageResponse -- use the hex values in the constants below
 * directly instead of this component.
 */

// Kept in sync with app/globals.css by hand. next/og's ImageResponse cannot
// read CSS custom properties, so any raster export of this mark (OG image,
// apple touch icon) needs these literal values rather than var(--color-ink).
// The spine is BRAND (the mark's own identity), never risk-flag red -- see
// the note at the top of globals.css on why the two systems stay separate.
export const SHIELD_MARK_INK_LIGHT = "#14201B";
export const SHIELD_MARK_INK_DARK = "#F3ECE3";
export const SHIELD_MARK_BRAND_LIGHT = "#B04000";
export const SHIELD_MARK_BRAND_DARK = "#F0891F";

export function ShieldMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="ClauseGuard shield mark"
    >
      {/* Shield outline. Straight shoulders, a single peak, a single point --
          drawn as one path with a handful of anchors rather than a decorative
          curve, so it stays crisp at small sizes. */}
      <path
        d="M50,6 L82,19 L82,49 C82,71 68,85 50,94 C32,85 18,71 18,49 L18,19 Z"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Scale of justice: stem, crossbar, two pans. Pans are a shallow arc
          each, not a filled bowl -- the same restraint as the rest of the
          mark. */}
      <circle cx="50" cy="26" r="2.2" fill="var(--color-ink)" />
      <line x1="50" y1="28" x2="50" y2="50" stroke="var(--color-ink)" strokeWidth="2.5" />
      <line x1="33" y1="32" x2="67" y2="32" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="33" y1="32" x2="33" y2="42" stroke="var(--color-ink)" strokeWidth="1.75" />
      <line x1="67" y1="32" x2="67" y2="42" stroke="var(--color-ink)" strokeWidth="1.75" />
      <path d="M26,42 Q33,49 40,42" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
      <path d="M60,42 Q67,49 74,42" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />

      {/* Open book, two flat pages meeting at a spine. The spine is the one
          accent in the mark -- the same copper the wordmark's "Guard" uses,
          never the risk-red, never spent twice in one place. */}
      <path
        d="M29,63 L48,59 L48,74 L29,78 Z"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <path
        d="M71,63 L52,59 L52,74 L71,78 Z"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />
      <line x1="50" y1="57" x2="50" y2="76" stroke="var(--color-brand)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
