import type { Metadata } from "next";
import { EB_Garamond, Work_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/store";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Overlays from "@/components/Overlays";
import { ArtDefs } from "@/components/ObjectArt";

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
  metadataBase: new URL("https://karmaura.example"),
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${ebGaramond.variable} ${workSans.variable}`}
    >
      <body>
        <StoreProvider>
          <ArtDefs />
          <div className="km-shell flex min-h-screen flex-col bg-forest">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Overlays />
        </StoreProvider>
      </body>
    </html>
  );
}
