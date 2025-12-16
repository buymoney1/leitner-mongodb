const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  clientsClaim: true,
  disable: process.env.NODE_ENV === 'development',
  
  runtimeCaching: [
    {
      urlPattern: /\/api\/.*/,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'api-cache',
      }
    },
    {
      urlPattern: /\/articles\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'articles-cache',
        networkTimeoutSeconds: 3
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|css|js)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60
        }
      }
    }
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {


  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.britannica.com',
        port: '',
        pathname: '/**',
      },
  
      // {
      //   protocol: 'https',
      //   hostname: 'images.unsplash.com',
      // },

    ],
  },
};

module.exports = withPWA(nextConfig);