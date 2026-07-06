export const siteConfig = {
  name: "पुरानी Kitabe",
  title: "पुरानी Kitabe · Search secondhand books across India",
  description:
    "Find second hand books in India with one search across used-book sellers like MyPustak, 99Bookscart, Bookchor, BookMandee, Kitabay, and more.",
  keywords: [
    "second hand books India",
    "used books India",
    "old books online",
    "buy used books online India",
    "pre-owned books India",
    "cheap books India",
    "MyPustak",
    "Bookchor",
    "99Bookscart",
  ],
};

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (!configuredUrl) {
    return new URL("http://localhost:3000");
  }

  const url = configuredUrl.startsWith("http")
    ? configuredUrl
    : `https://${configuredUrl}`;

  return new URL(url);
}
