import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "ClauseGuard -- Know what you're signing. A contract clause with the phrase 'for any reason or no reason' underlined in red, marked High risk, checked against Civil Code Art. 1308.";

/**
 * Reuses the hero's own concept -- a marked-up clause, not a logo on a
 * gradient -- so the link preview and the page it points to make the same
 * argument. Text is duplicated from app/page.tsx by design: ImageResponse
 * cannot import the page component, and this card needs to stand on its own
 * in a chat thread with no surrounding context.
 *
 * Two colour systems, kept separate exactly as they are in app/globals.css:
 * the "Guard" wordmark is brand copper (#F0891F) because it is the product's
 * identity; the marked clause and "High risk" badge stay risk-red (#E2503A)
 * because they are demonstrating a verdict, not decorating a page.
 */
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#120F0C",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#F3ECE3" }}>
            Clause
          </span>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#F0891F" }}>
            Guard
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 600,
            color: "#F3ECE3",
            lineHeight: 1.1,
            marginTop: 28,
            maxWidth: 880,
          }}
        >
          Know what you&rsquo;re signing.
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#1E1915",
            border: "1px solid #362E27",
            borderRadius: 4,
            padding: "28px 32px",
            marginTop: 40,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 22,
              lineHeight: 1.7,
              color: "#F3ECE3",
            }}
          >
            <span>14.2&nbsp;&nbsp;The Client may terminate this Agreement at any time,&nbsp;</span>
            <span
              style={{
                display: "flex",
                background: "#3A1E17",
                boxShadow: "inset 0 -3px 0 0 #E2503A",
                padding: "0 3px",
              }}
            >
              for any reason or no reason
            </span>
            <span>.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 18, gap: 14 }}>
            <div
              style={{
                display: "flex",
                background: "#3A1E17",
                color: "#E2503A",
                fontFamily: "sans-serif",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "6px 10px",
                borderRadius: 2,
              }}
            >
              High risk
            </div>
            <div style={{ display: "flex", fontSize: 18, color: "#B7A99B", fontFamily: "sans-serif" }}>
              Civil Code, Art. 1308
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#B7A99B",
            fontFamily: "sans-serif",
            marginTop: 32,
          }}
        >
          Checked against the Civil Code and Labor Code. Built for freelancers
          and small businesses without a lawyer on call.
        </div>
      </div>
    ),
    { ...size },
  );
}
