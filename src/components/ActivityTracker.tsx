'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// تایمرهای فعال برای ردیابی
const activeTimers = new Map<string, { startTime: number; timerId: NodeJS.Timeout }>();

// کلید ذخیره‌سازی در localStorage
const PROCESSED_ACTIVITIES_KEY = 'activity_processed_status';

// وضعیت پردازش فعالیت‌ها
interface ProcessedActivities {
  [key: string]: { // کلید: 'video_2024-01-15'
    activityType: string;
    date: string; // YYYY-MM-DD
    processed: boolean;
    lastProcessed: string;
  };
}

// دریافت وضعیت پردازش فعالیت‌ها
const getProcessedActivities = (): ProcessedActivities => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(PROCESSED_ACTIVITIES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('خطا در خواندن وضعیت پردازش:', error);
    return {};
  }
};

// ذخیره وضعیت پردازش فعالیت‌ها
const saveProcessedActivities = (activities: ProcessedActivities) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PROCESSED_ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error('خطا در ذخیره وضعیت پردازش:', error);
  }
};

// بررسی آیا فعالیت امروز پردازش شده
const isActivityProcessedToday = (activityType: string): boolean => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `${activityType}_${today}`;
  const activities = getProcessedActivities();
  
  return activities[key]?.processed || false;
};

// علامت گذاری فعالیت به عنوان پردازش شده
const markActivityAsProcessed = (activityType: string) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `${activityType}_${today}`;
  const activities = getProcessedActivities();
  
  activities[key] = {
    activityType,
    date: today,
    processed: true,
    lastProcessed: new Date().toISOString()
  };
  
  saveProcessedActivities(activities);
  console.log(`✅ ${activityType} امروز پردازش شد`);
};

// پاکسازی وضعیت‌های قدیمی (بیش از 30 روز)
const cleanupOldStatuses = () => {
  if (typeof window === 'undefined') return;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activities = getProcessedActivities();
  const filtered: ProcessedActivities = {};
  
  Object.entries(activities).forEach(([key, status]) => {
    const statusDate = new Date(status.date);
    if (statusDate >= thirtyDaysAgo) {
      filtered[key] = status;
    }
  });
  
  saveProcessedActivities(filtered);
};

export default function ActivityTracker() {
  const pathname = usePathname();
  const [lastActivity, setLastActivity] = useState<string>('');
  const [processedStatus, setProcessedStatus] = useState<Record<string, boolean>>({});

  // بروزرسانی وضعیت پردازش هنگام mount
  useEffect(() => {
    cleanupOldStatuses(); // پاکسازی قدیمی‌ها
    
    // وضعیت فعلی را بارگذاری کن
    const activities = getProcessedActivities();
    const today = new Date().toISOString().split('T')[0];
    
    const todayStatus: Record<string, boolean> = {};
    Object.entries(activities).forEach(([key, status]) => {
      if (key.endsWith(today)) {
        const activityType = key.split('_')[0];
        todayStatus[activityType] = status.processed;
      }
    });
    
    setProcessedStatus(todayStatus);
    console.log('📊 وضعیت پردازش امروز:', todayStatus);
  }, []);

  // تشخیص نوع فعالیت بر اساس مسیر
  const detectActivityType = (path: string) => {
    if (path.startsWith('/podcasts')) return 'podcast';
    if (path.startsWith('/video/')) return 'video';
    if (path === '/dashboard/review') return 'words';
    if (path.startsWith('/articles/')) return 'article';
    return null;
  };

  // استخراج ID محتوا از مسیر
  const extractContentId = (path: string): string | null => {
    const segments = path.split('/');
    return segments.length > 2 ? segments[2] : null;
  };

  // بررسی آیا باید فعالیت را ارسال کرد
  const shouldSendActivity = (activityType: string): boolean => {
    // اگر فعالیت امروز پردازش شده، نیازی به ارسال نیست
    if (isActivityProcessedToday(activityType)) {
      console.log(`⏸️  ${activityType} امروز پردازش شده، ارسال نمی‌شود`);
      return false;
    }
    
    return true;
  };

  // ارسال فعالیت به سرور - فقط اگر پردازش نشده باشد
  const sendActivityIfNeeded = async (activityType: string, duration: number, contentId?: string | null) => {
    try {
      // بررسی آیا باید ارسال شود
      if (!shouldSendActivity(activityType)) {
        console.log(`⏸️  ${activityType} پردازش شده، ارسال نمی‌شود`);
        return null;
      }
      
      console.log('📤 ارسال فعالیت:', { activityType, duration, contentId });
      const response = await fetch('/api/track-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityType,
          contentId,
          duration,
          pathname
        })
      });
      
      const data = await response.json();
      console.log('✅ فعالیت ثبت شد:', data);
      
      // اگر موفق بود، پردازش را شروع کن
      if (data.success) {
        await processActivitiesIfNeeded(activityType);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error sending activity:', error);
      return null;
    }
  };

  // پردازش فعالیت‌های ثبت‌نشده برای یک نوع خاص - فقط اگر نیاز باشد
  const processActivitiesIfNeeded = async (activityType: string) => {
    try {
      // اگر این فعالیت امروز پردازش شده، انجام نده
      if (isActivityProcessedToday(activityType)) {
        console.log(`⏸️  ${activityType} امروز قبلاً پردازش شده`);
        return { success: true, message: `Already processed ${activityType} today` };
      }
      
      console.log(`🔄 شروع پردازش ${activityType}...`);
      const response = await fetch('/api/planner/process-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log(`✅ نتیجه پردازش ${activityType}:`, data);
      
      // اگر پردازش موفق بود، این فعالیت را علامت گذاری کن
      if (data.success && data.data?.newlyCompleted?.[activityType]) {
        markActivityAsProcessed(activityType);
        setProcessedStatus(prev => ({
          ...prev,
          [activityType]: true
        }));
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Error processing ${activityType}:`, error);
      return null;
    }
  };

  // شروع ردیابی
  const startTracking = () => {
    const activityType = detectActivityType(pathname);
    if (!activityType) return;

    // اگر این فعالیت امروز پردازش شده، فقط لاگ نمایشی
    if (isActivityProcessedToday(activityType)) {
      console.log(`⏸️  ${activityType} امروز پردازش شده، ردیابی نمایشی`);
      
      const timerKey = `${activityType}_demo`;
      const startTime = Date.now();
      
      // تایمر نمایشی بدون ارسال به سرور
      const timerId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`👁️  نمایش ردیابی ${activityType}: ${elapsed} ثانیه`);
      }, 10000); // هر 10 ثانیه
      
      activeTimers.set(timerKey, { startTime, timerId });
      return;
    }

    const contentId = extractContentId(pathname);
    const timerKey = `${activityType}-${contentId || 'general'}`;

    // اگر از قبل در حال ردیابی است، تایمر قبلی را پاک کن
    if (activeTimers.has(timerKey)) {
      clearInterval(activeTimers.get(timerKey)!.timerId);
      activeTimers.delete(timerKey);
    }

    const startTime = Date.now();
    let accumulatedTime = 0;

    // هر 10 ثانیه وضعیت را بررسی و ثبت کن
    const timerId = setInterval(async () => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTime) / 1000); // به ثانیه
      accumulatedTime += 10;

      console.log(`⏱️  ردیابی ${activityType}:`, { accumulatedTime, elapsed });

      // اگر مجموع زمان به 10 ثانیه رسید و فعالیت پردازش نشده، ثبت کن
      if (accumulatedTime >= 10) {
        await sendActivityIfNeeded(activityType, accumulatedTime, contentId);
        accumulatedTime = 0;
        
        // تایمر جدید شروع کن
        clearInterval(timerId);
        startTracking();
      }
    }, 10000); // هر 10 ثانیه

    activeTimers.set(timerKey, { startTime, timerId });
  };

  // توقف ردیابی
  const stopTracking = async () => {
    for (const [timerKey, { startTime, timerId }] of activeTimers.entries()) {
      clearInterval(timerId);
      
      // اگر تایمر نمایشی است، ارسال نکن
      if (timerKey.includes('_demo')) {
        console.log(`👋 توقف ردیابی نمایشی برای ${timerKey.split('_')[0]}`);
        activeTimers.delete(timerKey);
        continue;
      }
      
      // ارسال نهایی فقط اگر فعالیت پردازش نشده
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      if (elapsedSeconds >= 5) {
        const [activityType, contentId] = timerKey.split('-');
        
        // بررسی آیا فعالیت پردازش شده
        if (!isActivityProcessedToday(activityType)) {
          await sendActivityIfNeeded(activityType, elapsedSeconds, contentId === 'general' ? null : contentId);
        } else {
          console.log(`⏸️  ${activityType} پردازش شده، ارسال نهایی نمی‌شود`);
        }
      }
      
      activeTimers.delete(timerKey);
    }
  };

  // اثر برای ردیابی تغییر مسیر
  useEffect(() => {
    // اگر مسیر تغییر کرد
    if (pathname !== lastActivity) {
      // اول تایمرهای قبلی را متوقف کن
      stopTracking().then(() => {
        // سپس ردیابی جدید را شروع کن اگر مسیر مجاز است
        const activityType = detectActivityType(pathname);
        if (activityType) {
          console.log('🔄 شروع ردیابی برای مسیر:', pathname);
          startTracking();
          setLastActivity(pathname);
        }
      });
    }
  }, [pathname]);

  // اثر برای ردیابی خروج از صفحه
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('👋 کاربر صفحه را ترک کرد');
        stopTracking();
      } else {
        const activityType = detectActivityType(pathname);
        if (activityType) {
          console.log('👋 کاربر به صفحه بازگشت');
          startTracking();
        }
      }
    };

    const handleBeforeUnload = () => {
      console.log('👋 بستن صفحه');
      stopTracking();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // شروع اولیه ردیابی
    const activityType = detectActivityType(pathname);
    if (activityType) {
      console.log('🚀 شروع ردیابی اولیه برای:', pathname);
      startTracking();
    }

    return () => {
      stopTracking();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // نمایش وضعیت در صفحه (اختیاری)
  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      zIndex: 9999,
      opacity: 0.8,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    }}>
      {['video', 'podcast', 'words', 'article'].map(activityType => (
        <div
          key={activityType}
          style={{
            background: processedStatus[activityType] ? '#10B981' : '#F59E0B',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '9px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            transition: 'all 0.3s'
          }}
        >
          <div style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: processedStatus[activityType] ? '#047857' : '#D97706',
            animation: processedStatus[activityType] ? 'none' : 'pulse 2s infinite'
          }} />
          <span>
            {activityType === 'video' && '🎬'}
            {activityType === 'podcast' && '🎧'}
            {activityType === 'words' && '📚'}
            {activityType === 'article' && '📖'}
            {processedStatus[activityType] ? '✅' : '🔄'}
          </span>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}