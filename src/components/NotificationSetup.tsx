// components/NotificationSetup.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function NotificationSetup({ userId }: { userId?: string }) {
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    const setupNotifications = async () => {
      // اگر در حال setup هستیم یا قبلاً setup شده، برگرد
      if (isSettingUp) return;
      
      // چک کن که قبلاً نوتیفیکیشن فعال شده یا نه
      const notificationSetup = localStorage.getItem('notification_setup');
      if (notificationSetup === 'completed') {
        return;
      }

      setIsSettingUp(true);

      try {
        // 1. درخواست permission
        if (!('Notification' in window)) {
          console.log('این مرورگر از Notification پشتیبانی نمی‌کند');
          setIsSettingUp(false);
          return;
        }

        // چک کن که آیا قبلاً permission گرفته شده یا نه
        const existingPermission = Notification.permission;
        
        if (existingPermission === 'granted') {
          // اگر قبلاً permission داده شده، فقط service worker رو چک کن
          if ('serviceWorker' in navigator) {
            try {
              const registration = await navigator.serviceWorker.register('/sw.js');
              console.log('Service Worker ثبت شد:', registration);
              
              // چک کن که آیا subscription قبلاً ثبت شده
              const pushManager = registration.pushManager;
              const subscription = await pushManager.getSubscription();
              
              if (!subscription && userId) {
                // اگر subscription نداریم، ثبت کنیم
                const newSubscription = await pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
                  ),
                });
                
                await saveSubscription(userId, newSubscription);
              }
              
              localStorage.setItem('notification_setup', 'completed');
              toast.success('نوتیفیکیشن‌ها فعال شدند!');
            } catch (error) {
              console.error('خطا در ثبت Service Worker:', error);
            }
          }
        } else if (existingPermission === 'default') {
          // اگر هنوز permission گرفته نشده، از کاربر بپرس
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
                
                localStorage.setItem('notification_setup', 'completed');
                toast.success('نوتیفیکیشن‌ها فعال شدند!');
              } catch (error) {
                console.error('خطا در ثبت Service Worker:', error);
              }
            }
          } else {
            console.log('کاربر دسترسی نوتیفیکیشن را نداد');
            localStorage.setItem('notification_setup', 'denied');
          }
        } else if (existingPermission === 'denied') {
          console.log('کاربر قبلاً دسترسی نوتیفیکیشن را رد کرده');
          localStorage.setItem('notification_setup', 'denied');
        }
      } catch (error) {
        console.error('خطا در تنظیم نوتیفیکیشن:', error);
        localStorage.setItem('notification_setup', 'failed');
      } finally {
        setIsSettingUp(false);
      }
    };

    // فقط در client-side و اگر userId داریم
    if (typeof window !== 'undefined' && userId) {
      setupNotifications();
    }
  }, [userId, isSettingUp]);

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