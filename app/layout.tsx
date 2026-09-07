import type { Metadata, Viewport } from "next";
import { Inter, Tinos } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://clauseguard.vercel.app";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Metrically compatible with Times New Roman for raw contract parchment excerpts
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
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${tinos.variable} font-sans`}
    >
      <body className="bg-white text-black antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
