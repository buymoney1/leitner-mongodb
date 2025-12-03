'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// کلید ذخیره‌سازی در localStorage
const PROCESSED_ACTIVITIES_KEY = 'activity_processed_status';

interface ActivityStatus {
  video: boolean;
  podcast: boolean;
  words: boolean;
  article: boolean;
}

export default function EnhancedActivityTracker() {
  const pathname = usePathname();
  const [processedStatus, setProcessedStatus] = useState<ActivityStatus>({
    video: false,
    podcast: false,
    words: false,
    article: false
  });
  const [loading, setLoading] = useState(true);

  // بارگذاری وضعیت از سرور
  useEffect(() => {
    loadActivityStatus();
  }, []);

  const loadActivityStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/activity/status');
      const data = await response.json();
      
      if (data.success) {
        setProcessedStatus({
          video: data.data.video.processed,
          podcast: data.data.podcast.processed,
          words: data.data.words.processed,
          article: data.data.article.processed
        });
        
        // ذخیره در localStorage برای دسترسی سریع
        const today = new Date().toISOString().split('T')[0];
        const statusToStore = {
          [`video_${today}`]: { processed: data.data.video.processed },
          [`podcast_${today}`]: { processed: data.data.podcast.processed },
          [`words_${today}`]: { processed: data.data.words.processed },
          [`article_${today}`]: { processed: data.data.article.processed }
        };
        
        localStorage.setItem(PROCESSED_ACTIVITIES_KEY, JSON.stringify(statusToStore));
      }
    } catch (error) {
      console.error('Error loading activity status:', error);
      // اگر سرور در دسترس نبود، از localStorage استفاده کن
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(PROCESSED_ACTIVITIES_KEY);
    
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setProcessedStatus({
          video: data[`video_${today}`]?.processed || false,
          podcast: data[`podcast_${today}`]?.processed || false,
          words: data[`words_${today}`]?.processed || false,
          article: data[`article_${today}`]?.processed || false
        });
      } catch (error) {
        console.error('Error parsing localStorage:', error);
      }
    }
  };

  // تشخیص نوع فعالیت
  const detectActivityType = (path: string): keyof ActivityStatus | null => {
    if (path.startsWith('/podcasts')) return 'podcast';
    if (path.startsWith('/video/')) return 'video';
    if (path === '/dashboard/review') return 'words';
    if (path.startsWith('/articles/')) return 'article';
    return null;
  };

  // بررسی آیا فعالیت پردازش شده
  const isActivityProcessed = (activityType: keyof ActivityStatus): boolean => {
    return processedStatus[activityType];
  };

  // وقتی مسیر تغییر کرد
  useEffect(() => {
    const activityType = detectActivityType(pathname);
    
    if (activityType) {
      if (isActivityProcessed(activityType)) {
        console.log(`✅ ${activityType} امروز پردازش شده، ردیابی غیرفعال`);
      } else {
        console.log(`🔄 ${activityType} نیاز به ردیابی دارد`);
      }
    }
  }, [pathname, processedStatus]);

  // رفرش وضعیت هر 5 دقیقه
  useEffect(() => {
    const interval = setInterval(() => {
      loadActivityStatus();
    }, 5 * 60 * 1000); // هر 5 دقیقه

    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

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
      {(Object.entries(processedStatus) as [keyof ActivityStatus, boolean][]).map(([type, processed]) => (
        <div
          key={type}
          style={{
            background: processed ? '#10B981' : '#F59E0B',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '9px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
          title={processed ? `${type} امروز پردازش شده` : `${type} نیاز به پردازش`}
        >
          <div style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: processed ? '#047857' : '#D97706'
          }} />
          <span>
            {type === 'video' && '🎬'}
            {type === 'podcast' && '🎧'}
            {type === 'words' && '📚'}
            {type === 'article' && '📖'}
            {processed ? '✅' : '🔄'}
          </span>
        </div>
      ))}
    </div>
  );
}