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

export const metadata: Metadata = {
  title: "fluid",
  description:
    "Statistical thermodynamics and computational chemistry of soft matter, with undergraduates at Harvey Mudd College.",
  openGraph: {
    title: "fluid",
    description:
      "Statistical thermodynamics and computational chemistry of soft matter, with undergraduates at Harvey Mudd College.",
    type: "website",
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
