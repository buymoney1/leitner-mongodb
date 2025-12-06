// components/PushNotificationManager.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import { notificationService } from '../../lib/notification';

export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
      
      // ثبت Service Worker
      if ('serviceWorker' in navigator) {
        notificationService.registerServiceWorker();
      }
    }
  }, []);

  const requestPermission = async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    
    if (newPermission === 'granted') {
      toast.success('دسترسی نوتیفیکیشن تایید شد!');
    } else if (newPermission === 'denied') {
      toast.error('دسترسی نوتیفیکیشن رد شد');
    }
  };

  const testPushNotification = async () => {
    await notificationService.showPushNotification('🔔 پیام آزمایشی', {
      body: 'این یک پیام آزمایشی Push Notification است',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      image: '/notification-image.png',
      tag: 'test-notification',
      requireInteraction: true,
      silent: false,
      data: {
        url: '/notifications',
        timestamp: new Date().toISOString(),
      },
      actions: [
        {
          action: 'view',
          title: 'مشاهده',
        },
        {
          action: 'dismiss',
          title: 'رد',
        },
      ],
    });
  };

  const scheduleNotification = () => {
    notificationService.scheduleNotification('⏰ یادآوری', {
      body: 'این یک نوتیفیکیشن زمان‌بندی شده است',
      delay: 5000, // 5 ثانیه بعد
      icon: '/icon-192x192.png',
      data: { url: '/reminders' },
    });
    
    toast.info('نوتیفیکیشن برای ۵ ثانیه دیگر تنظیم شد');
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-300">
          مرورگر شما از Push Notification پشتیبانی نمی‌کند
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 border rounded-lg mb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {permission === 'granted' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <h3 className="font-semibold">وضعیت دسترسی نوتیفیکیشن</h3>
          <span className={`px-2 py-1 rounded text-sm ${
            permission === 'granted' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : permission === 'denied'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {permission === 'granted' ? 'تایید شده' 
             : permission === 'denied' ? 'رد شده' 
             : 'در انتظار'}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {permission !== 'granted' && (
            <Button 
              onClick={requestPermission}
              variant="default"
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              درخواست دسترسی
            </Button>
          )}

          {permission === 'granted' && (
            <>
              <Button 
                onClick={testPushNotification}
                variant="outline"
              >
                تست Push Notification
              </Button>
              
              <Button 
                onClick={scheduleNotification}
                variant="secondary"
              >
                زمان‌بندی نوتیفیکیشن
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">تنظیمات پیشرفته</h4>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>• Push Notification ها حتی وقتی سایت باز نیست نمایش داده می‌شوند</p>
          <p>• برای تست، سایت را بسته و دکمه تست را فشار دهید</p>
          <p>• تنظیمات مرورگر: chrome://settings/content/notifications</p>
        </div>
      </div>
    </div>
  );
}