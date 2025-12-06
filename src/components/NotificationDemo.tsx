// components/NotificationDemo.tsx
'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function NotificationDemo() {
  const showNotification = (type: string) => {
    switch (type) {
      case 'success':
        toast.success('عملیات با موفقیت انجام شد!', {
          description: 'اطلاعات شما با موفقیت ذخیره گردید.',
          duration: 5000,
          action: {
            label: 'بازگشت',
            onClick: () => console.log('بازگشت'),
          },
        });
        break;

      case 'error':
        toast.error('خطا در انجام عملیات!', {
          description: 'لطفاً مجدداً تلاش نمایید.',
          duration: 8000,
        });
        break;

      case 'loading':
        toast.loading('در حال پردازش اطلاعات...', {
          duration: 3000,
        });
        break;

      case 'promise':
        const promise = () => new Promise((resolve, reject) => {
          setTimeout(() => {
            Math.random() > 0.5 ? resolve('موفق') : reject('ناموفق');
          }, 2000);
        });

        toast.promise(promise, {
          loading: 'در حال بارگذاری...',
          success: (data) => `عملیات ${data} بود!`,
          error: 'خطا در انجام عملیات',
        });
        break;

      case 'custom':
        toast.custom(
          (t) => (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300">🔔</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    نوتیفیکیشن سفارشی
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    این یک پیام سفارشی است
                  </p>
                </div>
                <button
                  onClick={() => toast.dismiss(t)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  تایید
                </button>
                <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                  رد
                </button>
              </div>
            </div>
          ),
          {
            duration: 10000,
          }
        );
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => showNotification('success')}>
          موفقیت
        </Button>
        <Button variant="destructive" onClick={() => showNotification('error')}>
          خطا
        </Button>
        <Button variant="secondary" onClick={() => showNotification('loading')}>
          در حال بارگذاری
        </Button>
        <Button variant="outline" onClick={() => showNotification('promise')}>
          Promise
        </Button>
        <Button variant="default" onClick={() => showNotification('custom')}>
          سفارشی
        </Button>
      </div>
    </div>
  );
}