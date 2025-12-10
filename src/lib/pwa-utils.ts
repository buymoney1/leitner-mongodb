// src/lib/pwa-simple.ts

// آپدیت خودکار بدون سؤال از کاربر
export function initAutoUpdatePWA() {
  // فقط در کلاینت اجرا شود
  if (typeof window === 'undefined') return;
  
  // فقط اگر service worker پشتیبانی شود
  if (!('serviceWorker' in navigator)) return;
  
  // حالت توسعه: غیرفعال کردن service worker
  if (process.env.NODE_ENV === 'development') {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
    return;
  }
  
  // حالت تولید: ثبت service worker
  navigator.serviceWorker.register('/sw.js', { scope: '/' })
    .then(registration => {
      console.log('✅ Service Worker ثبت شد');
      
      // وقتی آپدیت جدید پیدا شد
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            // اگر سرویس ورکر جدید نصب شد
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 آپدیت جدید یافت شد - فعال‌سازی خودکار');
              
              // آپدیت خودکار بدون سؤال
              if (registration.waiting) {
                // ارسال پیام برای فعال‌سازی فوری
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
            }
          });
        }
      });
      
      // وقتی سرویس ورکر جدید کنترل رو گرفت
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 کنترل تغییر کرد - رفرش صفحه');
        window.location.reload();
      });
    })
    .catch(error => {
      console.error('❌ خطا در ثبت Service Worker:', error);
    });
  
  // چک دوره‌ی آپدیت‌ها هر ۵ دقیقه
  setInterval(() => {
    navigator.serviceWorker.ready
      .then(registration => registration.update())
      .catch(console.error);
  }, 5 * 60 * 1000);
}

// پاک کردن کش‌های قدیمی
export async function clearPWACache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('🧹 کش‌های PWA پاک شدند');
  }
}