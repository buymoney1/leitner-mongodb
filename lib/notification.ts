// lib/notification.ts
class NotificationService {
    private static instance: NotificationService;
    private permission: NotificationPermission = 'default';
  
    private constructor() {}
  
    static getInstance(): NotificationService {
      if (!NotificationService.instance) {
        NotificationService.instance = new NotificationService();
      }
      return NotificationService.instance;
    }
  
    async registerServiceWorker(): Promise<void> {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker ثبت شد:', registration);
        } catch (error) {
          console.error('خطا در ثبت Service Worker:', error);
        }
      }
      return;
    }
  
    async requestPermission(): Promise<NotificationPermission> {
      if (!('Notification' in window)) {
        console.log('این مرورگر از Notification API پشتیبانی نمی‌کند');
        return 'denied';
      }
  
      if (Notification.permission === 'granted') {
        return 'granted';
      }
  
      if (Notification.permission !== 'denied') {
        this.permission = await Notification.requestPermission();
      }
  
      return this.permission;
    }
  
    async showPushNotification(title: string, options?: NotificationOptions): Promise<void> {
      const permission = await this.requestPermission();
  
      if (permission !== 'granted') {
        console.log('دسترسی Notification داده نشده است');
        return;
      }
  
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          await registration.showNotification(title, {
            body: options?.body || 'پیام جدید',
            icon: options?.icon || '/icon-192x192.png',
            badge: options?.badge || '/badge-72x72.png',
            image: options?.image,
            tag: options?.tag || 'default',
            renotify: options?.renotify || false,
            silent: options?.silent || false,
            requireInteraction: options?.requireInteraction || false,
            actions: options?.actions || [],
            data: options?.data || {},
            dir: 'rtl',
            lang: 'fa-IR',
            ...options,
          });
        } catch (error) {
          console.error('خطا در نمایش Push Notification:', error);
        }
      } else {
        // Fallback به Notification مرورگر
        new Notification(title, {
          ...options,
          dir: 'rtl',
          lang: 'fa-IR',
        });
      }
    }
  
    async scheduleNotification(
      title: string,
      options: NotificationOptions & { delay: number }
    ): Promise<void> {
      setTimeout(() => {
        this.showPushNotification(title, options);
      }, options.delay);
    }
  }
  
  export const notificationService = NotificationService.getInstance();