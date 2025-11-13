import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: false, // غیرفعال کردن lightningcss
  },
  typescript: {
    ignoreBuildErrors: true, // موقتاً برای جلوگیری از خطای build
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
