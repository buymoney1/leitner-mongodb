import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";



const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

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

export default withNextVideo(nextConfig);