// components/NotificationSetup.tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function NotificationSetup({ userId }: { userId?: string }) {
  useEffect(() => {
    const setupNotifications = async () => {
      // 1. درخواست permission
      if (!('Notification' in window)) {
        console.log('این مرورگر از Notification پشتیبانی نمی‌کند');
        return;
      }

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('دسترسی نوتیفیکیشن داده شد');
        
        // 2. ثبت Service Worker
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker ثبت شد:', registration);
            
            // 3. دریافت subscription برای Push
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
              ),
            });
            
            // 4. ذخیره subscription در دیتابیس
            if (userId) {
              await saveSubscription(userId, subscription);
            }
            
            toast.success('نوتیفیکیشن‌ها فعال شدند!');
          } catch (error) {
            console.error('خطا در ثبت Service Worker:', error);
          }
        }
      }
    };

    // فقط در production و اگر userId داریم
    if (userId && process.env.NODE_ENV === 'production') {
      setupNotifications();
    }
  }, [userId]);

  return null;
}

// تبدیل کلید VAPID
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ذخیره subscription در دیتابیس
async function saveSubscription(userId: string, subscription: PushSubscription) {
  try {
    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription: JSON.stringify(subscription),
      }),
    });

    if (!response.ok) {
      console.error('خطا در ذخیره subscription');
    }
  } catch (error) {
    console.error('خطا در ارسال subscription:', error);
  }
}