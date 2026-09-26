import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://karmaura.vercel.app"),
  title: {
    default: "Karmaura Home",
    template: "Karmaura Home",
  },
  description:
    "Objects for the calm home: hand-thrown clay, undyed linen, woven reed. Made slowly, in small runs, by people we know.",
  openGraph: {
    title: "Karmaura Home",
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
      className={`${ebGaramond.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
