import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * ClauseGuard Favicon Mark:
 * 1:1 match with the website brand logo mark — Mint/Emerald (#0c8c5e) squircle
 * with a centered white "C" in bold sans-serif.
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
          background: "#0c8c5e",
          borderRadius: 7,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1,
            fontFamily: "Inter, system-ui, -apple-system, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size },
  );
}
