'use client';

import { useState, useEffect } from 'react';

interface PWAInstallState {
  decision: 'installed' | 'dismissed' | 'never_show' | null;
  lastShown: string | null;
  dismissedCount: number;
  isMobile: boolean;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [pwaState, setPwaState] = useState<PWAInstallState>({
    decision: null,
    lastShown: null,
    dismissedCount: 0,
    isMobile: false,
  });

  useEffect(() => {
    // بررسی نوع دستگاه
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // بارگذاری وضعیت از localStorage
    const savedState = localStorage.getItem('pwa_install_state');
    let state: PWAInstallState = {
      decision: null,
      lastShown: null,
      dismissedCount: 0,
      isMobile: isMobileDevice,
    };

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        state = { ...state, ...parsed };
      } catch (e) {
        console.error('Error parsing PWA state:', e);
      }
    }

    setPwaState(state);

    // شرایط نمایش پاپ‌آپ
    const shouldShowPrompt = () => {
      // اگر در حالت standalone هست (اپ نصب شده)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return false;
      }

      // اگر کاربر گفت "هرگز نشان نده"
      if (state.decision === 'never_show') {
        return false;
      }

      // اگر کاربر قبلاً نصب کرده
      if (state.decision === 'installed') {
        return false;
      }

      // اگر کاربر 3 بار یا بیشتر لغو کرده
      if (state.dismissedCount >= 3) {
        return false;
      }

      // اگر کمتر از 7 روز از آخرین نمایش گذشته
      if (state.lastShown) {
        const lastShownDate = new Date(state.lastShown);
        const daysSinceLastShown = Math.floor(
          (Date.now() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastShown < 7) {
          return false;
        }
      }

      // فقط برای موبایل
      return isMobileDevice;
    };

    if (shouldShowPrompt()) {
      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallPrompt(true);
        
        // به‌روزرسانی تاریخ آخرین نمایش
        const updatedState = {
          ...state,
          lastShown: new Date().toISOString(),
        };
        localStorage.setItem('pwa_install_state', JSON.stringify(updatedState));
        setPwaState(updatedState);
      };

      window.addEventListener('beforeinstallprompt', handler);

      // همچنین نمایش خودکار بعد از 8 ثانیه اگر رویداد beforeinstallprompt رخ نداد
      const autoShowTimer = setTimeout(() => {
        if (!showInstallPrompt && shouldShowPrompt()) {
          setShowInstallPrompt(true);
          
          // به‌روزرسانی تاریخ آخرین نمایش
          const updatedState = {
            ...state,
            lastShown: new Date().toISOString(),
          };
          localStorage.setItem('pwa_install_state', JSON.stringify(updatedState));
          setPwaState(updatedState);
        }
      }, 8000);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        clearTimeout(autoShowTimer);
      };
    }
  }, []);

  const updatePwaState = (newState: Partial<PWAInstallState>) => {
    const updatedState = { ...pwaState, ...newState };
    setPwaState(updatedState);
    localStorage.setItem('pwa_install_state', JSON.stringify(updatedState));
  };

  const installApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted PWA installation');
          updatePwaState({
            decision: 'installed',
            lastShown: new Date().toISOString(),
          });
          
          // نمایش پیام موفقیت
          setTimeout(() => {
            alert('اپ با موفقیت نصب شد! از اپ استفاده کنید.');
          }, 1000);
        } else {
          console.log('User dismissed PWA installation');
          handleDismiss(false);
        }
      } catch (error) {
        console.error('Error during PWA installation:', error);
        handleDismiss(false);
      }
    } else {
      // اگر deferredPrompt وجود ندارد (برای دسکتاپ یا مرورگرهای قدیمی)
      alert('برای نصب اپ، از منوی مرورگر گزینه "Add to Home Screen" یا "Install app" را انتخاب کنید.');
      handleDismiss(false);
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = (neverShowAgain: boolean) => {
    const newDismissedCount = pwaState.dismissedCount + 1;
    
    updatePwaState({
      decision: neverShowAgain ? 'never_show' : 'dismissed',
      dismissedCount: newDismissedCount,
      lastShown: new Date().toISOString(),
    });

    setShowInstallPrompt(false);
    setDeferredPrompt(null);

    if (neverShowAgain) {
      console.log('User opted to never see the prompt again');
    } else {
      console.log(`Prompt dismissed ${newDismissedCount} time(s)`);
    }
  };

  // اگر نباید نشان داده شود
  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-2xl z-50 animate-slide-up border border-blue-400/30">
      <div className="absolute top-3 right-3">
        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold">PWA</span>
        </div>
      </div>

      <div className="pr-10">
        <h3 className="font-bold text-lg mb-2">📱 نصب اپلیکیشن زبان آموزی</h3>
        <p className="text-blue-100 text-sm mb-3 leading-relaxed">
          با نصب اپ، بدون نیاز به مرورگر و با سرعت بیشتر به تمام محتواهای آموزشی دسترسی داشته باشید.
        </p>


        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleDismiss(true)}
            className="px-4 py-3 text-sm bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-[1.02] text-center flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            دیگر نمایش نده
          </button>
          
          <button
            onClick={() => handleDismiss(false)}
            className="px-4 py-3 text-sm bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-[1.02] text-center"
          >
            شاید بعداً
          </button>
          
          <button
            onClick={installApp}
            className="px-4 py-3 text-sm bg-white text-blue-600 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-[1.02] font-bold shadow-lg flex-1 text-center"
          >
            نصب اپلیکیشن
          </button>
        </div>

        <div className="text-xs text-blue-200 text-center mt-3">
          <p>تعداد لغو: {pwaState.dismissedCount} از ۳</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mt-4">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-1000 ease-linear"
          style={{ width: '0%' }}
          ref={(el) => {
            if (el) {
              setTimeout(() => {
                el.style.width = '100%';
              }, 10);
            }
          }}
        />
      </div>
    </div>
  );
}

// استایل‌های انیمیشن
const slideUpStyles = `
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-slide-up {
  animation: slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
`;

// اضافه کردن استایل‌ها به صورت پویا
if (typeof document !== 'undefined' && !document.querySelector('#pwa-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'pwa-styles';
  styleElement.textContent = slideUpStyles;
  document.head.appendChild(styleElement);
}