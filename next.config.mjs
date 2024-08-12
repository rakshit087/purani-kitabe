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
    ],
  },
};

export default nextConfig;
