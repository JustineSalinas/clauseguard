import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * ClauseGuard Apple Touch Icon:
 * Scaled 180x180 version of the brand mark matching the favicon and navbar mark.
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
          background: "#0c8c5e",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontSize: 124,
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
