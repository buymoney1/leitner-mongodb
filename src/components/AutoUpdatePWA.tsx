// src/components/AutoUpdatePWA.tsx
'use client';

import { initAutoUpdatePWA } from '@/lib/pwa-utils';
import { useEffect } from 'react';


export default function AutoUpdatePWA() {
  useEffect(() => {
    // راه‌اندازی آپدیت خودکار
    initAutoUpdatePWA();
    
    // وقتی آنلاین شد، چک کن برای آپدیت
    const handleOnline = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then(registration => registration.update())
          .catch(console.error);
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  // این کامپوننت چیزی رندر نمی‌کند
  return null;
}