// hooks/useNotification.ts
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { notificationService } from '../lib/notification';


export const useNotification = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      notificationService.registerServiceWorker();
    }
  }, []);

  const showToast = useCallback((
    type: 'success' | 'error' | 'info' | 'warning',
    message: string,
    description?: string,
    options?: any
  ) => {
    switch (type) {
      case 'success':
        toast.success(message, { description, ...options });
        break;
      case 'error':
        toast.error(message, { description, ...options });
        break;
      case 'info':
        toast.info(message, { description, ...options });
        break;
      case 'warning':
        toast.warning(message, { description, ...options });
        break;
    }
  }, []);

  const showPush = useCallback(async (
    title: string,
    body: string,
    pushOptions?: NotificationOptions
  ) => {
    if (permission !== 'granted') {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission !== 'granted') {
        showToast('warning', 'لطفاً دسترسی نوتیفیکیشن را فعال کنید');
        return;
      }
    }

    await notificationService.showPushNotification(title, {
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      dir: 'rtl',
      lang: 'fa-IR',
      ...pushOptions,
    });
  }, [permission, showToast]);

  return {
    permission,
    showToast,
    showPush,
    requestPermission: () => notificationService.requestPermission(),
  };
};