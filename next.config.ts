import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Product images: S3/CDN in production, the API's /uploads/* in development.
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3333", pathname: "/uploads/**" },
    ],
  },
};

export default withNextIntl(nextConfig);
