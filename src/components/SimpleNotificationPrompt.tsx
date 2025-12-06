// components/SimpleNotificationPrompt.tsx - نسخه اصلاح شده
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export function SimpleNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowPrompt()) {
        setShowPrompt(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const shouldShowPrompt = () => {
    if (typeof window === 'undefined') return false;
    
    if (!('Notification' in window)) return false;
    
    if (Notification.permission !== 'default') return false;
    
    const dismissed = localStorage.getItem('notificationDismissed');
    return dismissed !== 'true';
  };

  const handleAllow = async () => {
    console.log('🟡 شروع فرآیند فعال‌سازی...');
    setIsLoading(true);
    
    if (!('Notification' in window)) {
      toast.error('مرورگر شما از نوتیفیکیشن پشتیبانی نمی‌کند');
      setIsLoading(false);
      return;
    }

    try {
      // 1. درخواست permission
      console.log('1. درخواست permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      if (permission !== 'granted') {
        toast.warning('دسترسی داده نشد');
        setIsLoading(false);
        return;
      }

      // 2. بررسی VAPID key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('❌ VAPID public key تنظیم نشده');
        console.log('💡 در .env.local اضافه کنید: NEXT_PUBLIC_VAPID_PUBLIC_KEY=...');
        toast.error('تنظیمات سرور کامل نیست');
        setIsLoading(false);
        return;
      }

      // 3. ثبت Service Worker و منتظر فعال شدن بمانیم
      if ('serviceWorker' in navigator) {
        console.log('2. ثبت Service Worker...');
        let registration;
        
        try {
          // ابتدا بررسی می‌کنیم آیا قبلاً ثبت شده
          const existingRegistrations = await navigator.serviceWorker.getRegistrations();
          if (existingRegistrations.length > 0) {
            registration = existingRegistrations[0];
            console.log('✅ Service Worker از قبل ثبت شده بود');
          } else {
            registration = await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker ثبت شد');
          }
          
          // منتظر می‌مانیم تا Service Worker فعال شود
          if (registration.waiting) {
            console.log('⏳ Service Worker در حال انتظار است...');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          
          if (registration.installing) {
            console.log('⏳ Service Worker در حال نصب است...');
            await new Promise<void>((resolve) => {
              const worker = registration.installing;
              if (worker) {
                worker.addEventListener('statechange', () => {
                  if (worker.state === 'installed') {
                    console.log('✅ Service Worker نصب شد');
                    resolve();
                  }
                });
              } else {
                resolve();
              }
            });
          }
          
          // اطمینان از فعال بودن Service Worker
          await navigator.serviceWorker.ready;
          console.log('✅ Service Worker آماده است');
          
          // کمی بیشتر منتظر می‌مانیم
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 4. عضویت در Push
          console.log('3. عضویت در Push...');
          console.log('VAPID Key:', vapidPublicKey.substring(0, 30) + '...');
          
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
          });
          
          console.log('✅ Subscription ایجاد شد:');
          console.log('Endpoint:', subscription.endpoint);
          console.log('Keys:', subscription.toJSON().keys);
          
          // 5. ذخیره در سرور
          console.log('4. ذخیره در سرور...');
          const subscriptionData = {
            endpoint: subscription.endpoint,
            keys: subscription.toJSON().keys,
          };
          
          console.log('📦 داده‌های subscription:', subscriptionData);
          
          const response = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscription: JSON.stringify(subscriptionData),
              userId: session?.user?.id,
            }),
          });
          
          console.log('📤 پاسخ سرور:', response.status, response.statusText);
          
          if (response.ok) {
            const result = await response.json();
            console.log('📊 نتیجه:', result);
            
            toast.success('نوتیفیکیشن‌ها فعال شدند و تنظیمات ذخیره شد!');
            localStorage.setItem('notificationPromptShown', 'true');
          } else {
            const error = await response.json();
            console.error('❌ خطا در سرور:', error);
            toast.error('خطا در ذخیره تنظیمات');
          }
          
        } catch (error) {
          console.error('❌ خطا در ثبت:', error);
          toast.error('خطا در فعال‌سازی نوتیفیکیشن');
        }
      } else {
        console.log('⚠️ Service Worker پشتیبانی نمی‌شود');
        toast.error('مرورگر شما از Service Worker پشتیبانی نمی‌کند');
      }
      
    } catch (error) {
      console.error('❌ خطا کلی:', error);
      toast.error('خطا در دریافت دسترسی');
    } finally {
      setIsLoading(false);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationDismissed', 'true');
    setShowPrompt(false);
    toast.info('می‌توانید بعداً از تنظیمات فعال کنید');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔔</span>
            <div>
              <p className="font-medium">فعال‌سازی یادآوری مرور لغات</p>
              <p className="text-sm text-blue-100">نوتیفیکیشن را برای دریافت یادآوری فعال کنید</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAllow}
              disabled={isLoading}
              className="px-4 py-2 bg-white text-blue-600 font-medium rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  در حال فعال‌سازی...
                </>
              ) : (
                'فعال‌سازی'
              )}
            </button>
            <button
              onClick={handleDismiss}
              disabled={isLoading}
              className="px-4 py-2 border border-white/30 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
            >
              بعداً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// تابع کمکی
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  if (!base64String) {
    throw new Error('VAPID public key خالی است');
  }
  
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  try {
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (error) {
    console.error('❌ خطا در تبدیل VAPID key:', error);
    throw error;
  }
}