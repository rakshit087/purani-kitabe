import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "पुरानी Kitabe 📚",
  description:
    "Search for second hand books in India, across various sellers like MyPustak, 99Cart and Bookchor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="absolute top-8 right-8">
            <ThemeToggle />
          </div>
          {children}
          <footer className="py-4 text-center">
            <p className="text-xs">
              Made for the ❤️ of books by{" "}
              <Link
                href="https://twitter.com/rakshit087"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Rakshit
              </Link>
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
