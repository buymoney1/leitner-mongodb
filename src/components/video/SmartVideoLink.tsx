// components/video/SmartVideoLink.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Play, Film, Tv } from 'lucide-react';

interface SmartVideoLinkProps {
  videoId: string;
  className?: string;
  children: React.ReactNode;
}

export default function SmartVideoLink({ videoId, className, children }: SmartVideoLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSeries, setIsSeries] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkVideoType = async () => {
    if (isSeries !== null) return; // قبلاً چک شده
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/videos/${videoId}/check-type`);
      if (!response.ok) {
        throw new Error('Failed to check video type');
      }
      
      const data = await response.json();
      setIsSeries(data.isSeries);
    } catch (err) {
      console.error('Error checking video type:', err);
      setError('خطا در بررسی نوع ویدیو');
      setIsSeries(false); // پیش‌فرض تک قسمتی
    } finally {
      setIsLoading(false);
    }
  };

  const getHref = () => {
    if (isSeries === true) {
      return `/series/${videoId}`;
    }
    return `/video/${videoId}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSeries === null) {
      e.preventDefault();
      checkVideoType().then(() => {
        // بعد از چک کردن، لینک را دنبال کن
        window.location.href = getHref();
      });
    }
  };

  const Icon = isSeries ? Tv : isSeries === false ? Film : Play;

  return (
    <Link 
      href={getHref()}
      onClick={handleClick}
      className={`relative ${className}`}
      title={isSeries ? 'سریال (دارای فصل و قسمت)' : 'فیلم تک قسمتی'}
    >
      {children}
      
      {/* آیکون نشانگر نوع */}
      <div className="absolute top-2 left-2 z-10">
        {isLoading ? (
          <div className="w-6 h-6 rounded-full bg-blue-500/80 text-white flex items-center justify-center">
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-500/80 text-white flex items-center justify-center">
            <Icon className="w-3 h-3" />
          </div>
        )}
      </div>
    </Link>
  );
}