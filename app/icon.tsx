import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * ClauseGuard favicon: the same mark as the header logo
 * (components/brand/logo-badge.tsx) -- a solid copper shield holding a white
 * section sign (§) -- on a transparent background, so the tab icon and the
 * on-page logo are the same thing at both sizes. Keep the path and colour in
 * sync with logo-badge.tsx; next/og cannot import a client component.
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
          position: "relative",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" style={{ position: "absolute", top: 0, left: 0 }}>
          <path
            d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
            fill="#b04000"
          />
        </svg>
        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1,
            marginTop: 1,
          }}
        >
          §
        </div>
      </div>
    ),
    { ...size },
  );
}
