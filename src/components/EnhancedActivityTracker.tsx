// components/SimpleActivityTracker.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getActivityTimer } from '../../lib/activityTimer';


export default function SimpleActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // تشخیص نوع فعالیت
  const detectActivityType = (path: string): 'video' | 'podcast' | 'words' | 'article' | null => {
    if (path.startsWith('/podcasts') || path.includes('/podcast/')) return 'podcast';
    if (path.startsWith('/video/') || path.includes('/video/')) return 'video';
    if (path === '/dashboard/review' || path.includes('/review')) return 'words';
    if (path.startsWith('/articles/') || path.includes('/article/')) return 'article';

    return null;
  };

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    const userId = session.user.id;
    const activityType = detectActivityType(pathname);
    const timer = getActivityTimer();

    // بازیابی تایمرهای معوقه
    timer.recoverTimers(userId);

    if (!activityType) {
      // اگر در صفحه فعالیت نیست، همه تایمرها را متوقف کن
      ['video', 'podcast', 'words', 'article', 'song'].forEach(type => {
        timer.clearTimer(userId, type as any);
      });
      return;
    }

    console.log(`📍 صفحه: ${pathname} -> فعالیت: ${activityType}`);

    // شروع تایمر برای این فعالیت
    timer.startTimer(userId, activityType);

    // توقف تایمر قبلی اگر فعالیت تغییر کرد
    const previousType = localStorage.getItem('last_activity_type');
    if (previousType && previousType !== activityType) {
      timer.stopTimer(userId, previousType as any);
    }

    localStorage.setItem('last_activity_type', activityType);

    // هندلر برای زمانی که کاربر صفحه را ترک می‌کند
    const handleBeforeUnload = () => {
      timer.stopTimer(userId, activityType);
    };

    // هندلر برای تغییر visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        timer.stopTimer(userId, activityType);
      } else {
        timer.startTimer(userId, activityType);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // توقف خودکار بعد از 30 دقیقه
    const autoStopTimeout = setTimeout(() => {
      console.log('⏰ توقف خودکار پس از 30 دقیقه');
      timer.stopTimer(userId, activityType);
    }, 30 * 60 * 1000);

    // توقف هنگام unmount
    return () => {
      clearTimeout(autoStopTimeout);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      timer.stopTimer(userId, activityType);
    };
  }, [pathname, searchParams, session, status]);

  // برای دیباگ - نمایش وضعیت فعلی
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        🎯 ردیاب فعال
      </div>
    );
  }

  return null;
}