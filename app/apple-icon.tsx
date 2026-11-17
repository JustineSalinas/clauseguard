import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * ClauseGuard Apple touch icon: the header logo mark (copper shield, white §;
 * see app/icon.tsx and components/brand/logo-badge.tsx) centred on white.
 * iOS rounds the corners itself and fills transparency with black, so the
 * background is opaque white rather than transparent.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#ffffff",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 24 24" style={{ position: "absolute", top: 20, left: 20 }}>
          <path
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
            fill="#b04000"
          />
        </svg>
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 92,
            fontWeight: 700,
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          §
        </div>
      </div>
    ),
    { ...size },
  );
}
