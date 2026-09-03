import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Same mark as icon.tsx, scaled up for the iOS home-screen tile, which gets
 *  its own square background rather than the browser tab's rounded corner. */
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
          background: "#14201B",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 108,
              fontWeight: 700,
              color: "#F5F6F2",
              lineHeight: 1,
              fontFamily: "Georgia, serif",
            }}
          >
            C
          </div>
          <div style={{ width: 64, height: 14, background: "#E8837B", marginTop: 6, borderRadius: 2 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
