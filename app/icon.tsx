import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Generated at build time so the favicon is never out of sync with the
 * wordmark. "C" on the dark ground that is now the site's primary theme,
 * underlined in the brand copper -- the mark's own identity colour, never the
 * risk-red the product uses for a flagged clause.
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
          background: "#120F0C",
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
              color: "#F3ECE3",
              lineHeight: 1,
              fontFamily: "Georgia, serif",
            }}
          >
            C
          </div>
          <div style={{ width: 12, height: 3, background: "#F0891F", marginTop: 1 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
