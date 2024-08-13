/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.bookchor.com",
        port: "",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "d1f2zer3rm8sjv.cloudfront.net",
        port: "",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
