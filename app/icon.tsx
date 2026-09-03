import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Generated at build time so the favicon is never out of sync with the
 * wordmark. "C" in ink on the paper ground, underlined in the flag red the
 * product uses for its own risk output -- the same mark, reduced to 32px.
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
          background: "#F5F6F2",
          borderRadius: 4,
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
              fontSize: 20,
              fontWeight: 700,
              color: "#14201B",
              lineHeight: 1,
              fontFamily: "Georgia, serif",
            }}
          >
            C
          </div>
          <div style={{ width: 12, height: 3, background: "#BC3A28", marginTop: 1 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
