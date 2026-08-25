import type { Metadata } from "next";
import { Newsreader, Instrument_Sans, Tinos } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "ClauseGuard — Know what you're signing",
  description:
    "Upload a contract and see which clauses shift risk onto you, in plain language, checked against the Philippine Civil Code and Labor Code. Built for freelancers and small businesses without a lawyer on call.",
  openGraph: {
    title: "ClauseGuard — Know what you're signing",
    description:
      "See which contract clauses put you at risk, in plain language, checked against Philippine law.",
    type: "website",
  },
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
