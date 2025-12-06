// public/sw.js - نسخه بهبود یافته
console.log('📱 Service Worker در حال بارگذاری...');

self.addEventListener('install', (event) => {
  console.log('✅ Service Worker نصب شد');
  // بلافاصله فعال شود
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker فعال شد');
  // بلافاصله کنترل را بگیرد
  event.waitUntil(clients.claim());
});

// دریافت پیام‌ها از صفحه اصلی
self.addEventListener('message', (event) => {
  console.log('📨 دریافت پیام در Service Worker:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    console.log('⏩ درخواست skip waiting');
    self.skipWaiting();
  }
});

// مدیریت Push Notification
self.addEventListener('push', (event) => {
  console.log('🔔 دریافت Push Notification');
  
  if (!event.data) {
    console.log('⚠️ Push data ندارد');
    return;
  }

  let data;
  try {
    data = event.data.json();
    console.log('📊 داده‌های Push:', data);
  } catch (error) {
    data = {
      title: 'Leitner System',
      body: event.data.text() || 'یادآوری جدید',
    };
  }

  const options = {
    body: data.body || 'الان زمان مناسبیه برای مرور لغات',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    dir: 'rtl',
    lang: 'fa-IR',
    tag: data.tag || 'leitner-reminder',
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'review',
        title: 'مرور لغات',
      },
      {
        action: 'later',
        title: 'بعداً',
      }
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🌙 شب بخیر!', options)
      .then(() => {
        console.log('✅ Notification نمایش داده شد');
      })
      .catch(error => {
        console.error('❌ خطا در نمایش Notification:', error);
      })
  );
});

// مدیریت کلیک روی Notification
self.addEventListener('notificationclick', (event) => {
  console.log('👆 کلیک روی Notification:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      // اگر از قبل تب باز داریم، focus کنیم
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          console.log('✅ تب موجود focus شد');
          return client.focus();
        }
      }
      // در غیر این صورت تب جدید باز کنیم
      if (clients.openWindow) {
        console.log('🔄 باز کردن تب جدید');
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Cache برای آفلاین
const CACHE_NAME = 'leitner-v1';

self.addEventListener('fetch', (event) => {
  // فقط درخواست‌های GET را cache می‌کنیم
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // اگر در cache موجود بود برگردان
        if (cachedResponse) {
          console.log('💾 استفاده از cache');
          return cachedResponse;
        }

        // در غیر این صورت از شبکه بگیر
        return fetch(event.request)
          .then((response) => {
            // پاسخ‌های معتبر را cache کن
            if (response && response.status === 200 && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // برای صفحات، صفحه آفلاین را نشان بده
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});