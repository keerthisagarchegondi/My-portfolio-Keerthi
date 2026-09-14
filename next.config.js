/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  async rewrites() {
    return [
      {
        source: "/traffic-flow-early-warning",
        destination: "/traffic-flow-early-warning/index.html",
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
