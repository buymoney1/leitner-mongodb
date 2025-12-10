const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true, // مهم: خودکار آپدیت شود
  clientsClaim: true,
  disable: process.env.NODE_ENV === 'development',
  
  // تنظیمات ساده‌شده
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