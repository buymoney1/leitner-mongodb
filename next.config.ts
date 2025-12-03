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
    optimizeCss: true, // غیرفعال کردن lightningcss
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

  reactStrictMode: true,
  swcMinify: true,


};

export default withNextVideo(nextConfig);