import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SkipLink } from "@/components/SkipLink";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jbMono = JetBrains_Mono({
  variable: "--font-jb-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ohhmoo.github.io/FLUID-LabSite";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "fluid",
    template: "%s",
  },
  description:
    "Statistical thermodynamics and computational chemistry of soft matter, with undergraduates at Harvey Mudd College.",
  openGraph: {
    title: "fluid",
    description:
      "Statistical thermodynamics and computational chemistry of soft matter, with undergraduates at Harvey Mudd College.",
    type: "website",
    url: SITE_URL,
    siteName: "fluid",
  },
  twitter: {
    card: "summary",
    title: "fluid",
    description:
      "Statistical thermodynamics and computational chemistry of soft matter, with undergraduates at Harvey Mudd College.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jbMono.variable}`}>
      <body>
        <div className="page-backdrop" aria-hidden="true" />
        <SkipLink />
        <SiteHeader />
        <main id="main" className="pt-16">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
