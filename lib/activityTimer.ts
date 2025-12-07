// lib/clientActivityTimer.ts
'use client';

import { useEffect, useRef } from 'react';

// تعریف تایپ برای فعالیت‌ها
type ActivityType = 'video' | 'podcast' | 'words' | 'article';

class ClientActivityTimer {
  private timers: Map<string, { startTime: number; activityType: ActivityType }> = new Map();

  // شروع تایمر
  startTimer(userId: string, activityType: ActivityType) {
    const key = `${userId}_${activityType}`;
    
    // اگر تایمر از قبل فعال است، حذف کن
    if (this.timers.has(key)) {
      this.clearTimer(userId, activityType);
    }

    this.timers.set(key, {
      startTime: Date.now(),
      activityType
    });

    console.log(`⏱️ تایمر شروع شد: ${activityType} برای کاربر ${userId}`);
    
    // ذخیره در localStorage برای بازیابی در صورت رفرش
    localStorage.setItem(`activity_timer_${key}`, JSON.stringify({
      startTime: Date.now(),
      activityType
    }));
  }

  // توقف تایمر
  stopTimer(userId: string, activityType: ActivityType) {
    const key = `${userId}_${activityType}`;
    const timer = this.timers.get(key);
    
    if (!timer) {
      // شاید از localStorage موجود باشد
      const stored = localStorage.getItem(`activity_timer_${key}`);
      if (stored) {
        try {
          const storedTimer = JSON.parse(stored);
          const duration = Math.floor((Date.now() - storedTimer.startTime) / 1000);
          
          if (duration >= 10) {
            this.sendActivity(userId, activityType, duration);
          }
        } catch (error) {
          console.error('Error parsing stored timer:', error);
        }
        localStorage.removeItem(`activity_timer_${key}`);
      }
      return;
    }

    const duration = Math.floor((Date.now() - timer.startTime) / 1000);
    
    if (duration >= 10) {
      this.sendActivity(userId, activityType, duration);
    } else {
      console.log(`⏰ زمان ناکافی: ${duration} ثانیه`);
    }

    this.timers.delete(key);
    localStorage.removeItem(`activity_timer_${key}`);
  }

  // ارسال فعالیت به سرور
  private async sendActivity(userId: string, activityType: ActivityType, duration: number) {
    try {
      console.log(`✅ ثبت فعالیت: ${activityType} - ${duration} ثانیه`);
      
      const response = await fetch('/api/activity/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          activityType,
          duration,
          pathname: window.location.pathname
        })
      });

      if (!response.ok) {
        throw new Error('Failed to track activity');
      }

      const data = await response.json();
      console.log('فعالیت ثبت شد:', data);
      
    } catch (error) {
      console.error('❌ خطا در ثبت فعالیت:', error);
      
      // اگر سرور در دسترس نبود، در localStorage ذخیره کن
      this.saveActivityLocally(userId, activityType, duration);
    }
  }

  // ذخیره فعالیت در localStorage به صورت موقت
  private saveActivityLocally(userId: string, activityType: ActivityType, duration: number) {
    try {
      const pendingActivities = JSON.parse(localStorage.getItem('pending_activities') || '[]');
      
      pendingActivities.push({
        userId,
        activityType,
        duration,
        pathname: window.location.pathname,
        timestamp: Date.now()
      });

      localStorage.setItem('pending_activities', JSON.stringify(pendingActivities));
      console.log('فعالیت در localStorage ذخیره شد');
    } catch (error) {
      console.error('❌ خطا در ذخیره موقت:', error);
    }
  }

  // ارسال فعالیت‌های معوقه
  async sendPendingActivities() {
    try {
      const pendingActivities = JSON.parse(localStorage.getItem('pending_activities') || '[]');
      
      if (pendingActivities.length === 0) return;

      console.log(`📦 ارسال ${pendingActivities.length} فعالیت معوقه...`);
      
      const response = await fetch('/api/activity/batch-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: pendingActivities })
      });

      if (response.ok) {
        localStorage.removeItem('pending_activities');
        console.log('✅ فعالیت‌های معوقه ارسال شدند');
      }
    } catch (error) {
      console.error('❌ خطا در ارسال فعالیت‌های معوقه:', error);
    }
  }

  // حذف تایمر
  clearTimer(userId: string, activityType: ActivityType) {
    const key = `${userId}_${activityType}`;
    if (this.timers.has(key)) {
      this.timers.delete(key);
      localStorage.removeItem(`activity_timer_${key}`);
      console.log(`🗑️ تایمر حذف شد: ${activityType}`);
    }
  }

  // بازیابی تایمرهای معوقه از localStorage
  recoverTimers(userId: string) {
    const prefix = `activity_timer_${userId}_`;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(prefix)) {
        try {
          const timerData = JSON.parse(localStorage.getItem(key)!);
          const storedTime = timerData.startTime;
          const duration = Math.floor((Date.now() - storedTime) / 1000);
          
          // اگر بیشتر از 5 دقیقه گذشته، حذف کن
          if (duration > 5 * 60) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.error('Error recovering timer:', error);
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// ایجاد یک instance جهانی
let activityTimer: ClientActivityTimer | null = null;

export function getActivityTimer(): ClientActivityTimer {
  if (!activityTimer) {
    activityTimer = new ClientActivityTimer();
  }
  return activityTimer;
}

// هوک برای استفاده در کامپوننت‌ها
export function useActivityTimer() {
  const timerRef = useRef<ClientActivityTimer | null>(null);

  useEffect(() => {
    if (!timerRef.current) {
      timerRef.current = new ClientActivityTimer();
      
      // ارسال فعالیت‌های معوقه هنگام لود صفحه
      timerRef.current.sendPendingActivities();
    }

    return () => {
      // پاکسازی
      timerRef.current = null;
    };
  }, []);

  return timerRef.current;
}