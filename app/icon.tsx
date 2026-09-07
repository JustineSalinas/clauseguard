import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * ClauseGuard Favicon Mark:
 * A silhouette of the header shield mark (see shield-mark.tsx) -- outline
 * only, no scale or book, since that fine detail turns to mush at 16-32px.
 * Copper background matches the wordmark's "Guard" accent
 * (SHIELD_MARK_BRAND_LIGHT in shield-mark.tsx).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#b04000",
          borderRadius: 7,
        }}
      >
        <svg width="19" height="19" viewBox="0 0 100 100">
          <path
            d="M50,6 L82,19 L82,49 C82,71 68,85 50,94 C32,85 18,71 18,49 L18,19 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
