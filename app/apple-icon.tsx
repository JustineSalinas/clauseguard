import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * ClauseGuard Apple Touch Icon:
 * Scaled 180x180 version of the same shield silhouette used in app/icon.tsx.
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
          background: "#b04000",
          borderRadius: 40,
        }}
      >
        <svg width="108" height="108" viewBox="0 0 100 100">
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
