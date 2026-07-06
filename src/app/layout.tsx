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
import { InstagramLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
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
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
            <span>Made for the 💚 of books by Rakshit</span>
            <Link
              href="https://twitter.com/rakshit087"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect on Twitter"
              className="text-foreground transition-colors hover:text-primary"
            >
              <TwitterLogoIcon className="h-4 w-4" />
            </Link>
            <Link
              href="https://instagram.com/kitabi.corner"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect on Instagram"
              className="text-foreground transition-colors hover:text-primary"
            >
              <InstagramLogoIcon className="h-4 w-4" />
            </Link>
          </p>
        </footer>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
