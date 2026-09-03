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
          background: "#F5F6F2",
          padding: "64px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#14201B" }}>
            Clause
          </span>
          <span style={{ fontSize: 32, fontWeight: 700, color: "#BC3A28" }}>
            Guard
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 600,
            color: "#14201B",
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
            background: "#FFFFFF",
            border: "1px solid #DDE2DA",
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
              color: "#14201B",
            }}
          >
            <span>14.2&nbsp;&nbsp;The Client may terminate this Agreement at any time,&nbsp;</span>
            <span
              style={{
                display: "flex",
                background: "#F7E3DF",
                boxShadow: "inset 0 -3px 0 0 #BC3A28",
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
                background: "#F7E3DF",
                color: "#BC3A28",
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
            <div style={{ display: "flex", fontSize: 18, color: "#4A5A52", fontFamily: "sans-serif" }}>
              Civil Code, Art. 1308
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 20,
            color: "#4A5A52",
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
