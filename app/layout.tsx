import type { Metadata, Viewport } from "next";
import { Newsreader, Instrument_Sans, Tinos } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

// Not deployed yet -- swap for the real Vercel URL once it exists, or set
// NEXT_PUBLIC_SITE_URL in the environment and this picks it up with no code
// change. Without a base, Next.js cannot resolve openGraph/icon URLs to
// absolute ones, and a link shared before this is set may render with a
// broken preview image.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://clauseguard.vercel.app";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

// Metrically compatible with Times New Roman, which is what commercial
// contracts are actually set in. Used only for contract text.
const tinos = Tinos({
  variable: "--font-tinos",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const TITLE = "ClauseGuard — Know what you're signing";
const DESCRIPTION =
  "Upload a contract and see which clauses shift risk onto you, in plain language, checked against the Philippine Civil Code and Labor Code. Built for freelancers and small businesses without a lawyer on call.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s — ClauseGuard" },
  description: DESCRIPTION,
  applicationName: "ClauseGuard",
  keywords: [
    "contract review",
    "contract risk",
    "freelancer contract checker",
    "Philippine Civil Code",
    "Labor Code",
    "AI contract analysis",
  ],
  category: "productivity",
  // Genuinely not ready for indexing while auth points at a placeholder
  // Supabase project. Flip this the day the site is real and deployed --
  // an indexed placeholder is worse than a delayed one.
  robots: { index: false, follow: false },
  openGraph: {
    title: TITLE,
    description:
      "See which contract clauses put you at risk, in plain language, checked against Philippine law.",
    type: "website",
    siteName: "ClauseGuard",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "See which contract clauses put you at risk, in plain language, checked against Philippine law.",
  },
};

export const viewport: Viewport = {
  // Matches the two ground tokens in globals.css (--color-paper). Tells the
  // browser chrome (status bar, PWA splash) which theme is live rather than
  // leaving it to guess from page content.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5F6F2" },
    { media: "(prefers-color-scheme: dark)", color: "#120F0C" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The font variables must live on <html>, not <body>. Tailwind's @theme
  // declares --font-display on :root as var(--font-newsreader), and custom
  // properties substitute where they are declared. Defining --font-newsreader
  // further down the tree would leave the :root declaration invalid, and every
  // descendant would inherit that already-computed invalid value.
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${instrumentSans.variable} ${tinos.variable}`}
    >
      <body className="antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
