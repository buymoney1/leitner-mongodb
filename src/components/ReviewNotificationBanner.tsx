// src/components/ReviewNotificationBanner.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function ReviewNotificationBanner() {
  const [dueCount, setDueCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkForDueCards = async () => {
      try {
        const response = await fetch('/api/notifications/review-check');
        if (response.ok) {
          const data = await response.json();
          if (data.count > 0) {
            setDueCount(data.count);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Failed to check for due cards:", error);
      }
    };

    checkForDueCards();
  }, []);

  if (dueCount < 1) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between mx-auto max-w-4xl mb-3">
      <div className="flex items-center">
        <svg className="w-6 h-6 ml-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-sm">
          شما {dueCount} کارت برای مرور امروز دارید!
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link 
          href="/dashboard/review" // <-- لینک به صفحه مرور خودتان را اینجا قرار دهید
          className="bg-white text-red-500 px-4 text-sm py-1 font-semibold rounded-md hover:bg-gray-100 transition-colors"
        >
          شروع مرور
        </Link>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 transition-colors"
          aria-label="بستن اطلاعیه"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}