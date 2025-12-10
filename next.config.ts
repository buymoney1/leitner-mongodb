// next.config.ts
import { withNextVideo } from "next-video/process";
import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  disable: process.env.NODE_ENV === 'development',
  
  runtimeCaching: [
    // APIها اصلاً کش نشوند
    {
      urlPattern: /\/api\/.*/,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'api-cache',
      }
    },
    // صفحات داینامیک با اولویت شبکه
    {
      urlPattern: /\/articles\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'articles-cache',
        networkTimeoutSeconds: 3
      }
    },
    // استاتیک assets کش شوند
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|css|js)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 روز
        }
      }
    }
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizeCss: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ ESLint غیرفعال در build
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  reactStrictMode: true,
  swcMinify: true,
};

// ✅ ترتیب درست: اول withPWA، بعد withNextVideo
export default withNextVideo(withPWA(nextConfig));