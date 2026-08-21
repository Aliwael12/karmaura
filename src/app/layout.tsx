import type { Metadata } from "next";
import { EB_Garamond, Work_Sans } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-work-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://karmaura.vercel.app"),
  title: {
    default: "KARMAURA · HOME — Good energy, good home",
    template: "%s — KARMAURA · HOME",
  },
  description:
    "Objects for the calm home — hand-thrown clay, undyed linen, woven reed. Made slowly, in small runs, by people we know.",
  icons: { icon: "/brand/emblem.png" },
  openGraph: {
    title: "KARMAURA · HOME",
    description: "The warmth of simple things.",
    type: "website",
  },
};

/**
 * Only the document itself. The shop's chrome — header, footer, bag drawer —
 * lives in the (shop) group's layout, so /admin renders without any of it.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${ebGaramond.variable} ${workSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
