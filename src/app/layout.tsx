import type { Metadata } from "next";
import {
  Inter,
  Newsreader,
  Spline_Sans_Mono,
  Tiro_Devanagari_Hindi,
} from "next/font/google";
import "./globals.css";
import Link from "next/link";
import QueryProvider from "@/components/query-client";
import { GoogleAnalytics } from "@/components/GoogleAnalytics/GoogleAnalytics";
import { getSiteUrl, siteConfig } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});
const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});
const tiro = Tiro_Devanagari_Hindi({
  subsets: ["devanagari"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-tiro",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    creator: "@rakshit087",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  category: "books",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${newsreader.variable} ${mono.variable} ${tiro.variable} font-sans antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <footer className="border-t border-border/60 py-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Made for the 💚 of books by{" "}
            <Link
              href="https://twitter.com/rakshit087"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-primary/50 underline-offset-4 transition-colors hover:decoration-primary"
            >
              Rakshit
            </Link>
          </p>
        </footer>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
