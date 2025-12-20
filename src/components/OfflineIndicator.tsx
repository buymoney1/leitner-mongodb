'use client';

import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50 text-center">
      <div className="flex items-center justify-center gap-2">
        <span className='text-sm'>شما در حالت آفلاین هستید</span>
      </div>
    </div>
  );
}