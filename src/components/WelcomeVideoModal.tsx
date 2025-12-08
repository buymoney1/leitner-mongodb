// components/WelcomeVideoModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Play, CheckCircle, X, Home, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface WelcomeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function WelcomeVideoModal({
  isOpen,
  onClose,
  userName,
}: WelcomeVideoModalProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoError, setVideoError] = useState(false);
  
  // مسیر ویدیو از پوشه public
  // می‌توانید ویدیوهای مختلف داشته باشید:
  const videoSources = {
    welcome: '/preview.mp4',

  };
  
  // انتخاب ویدیو مورد نظر
  const videoUrl = videoSources.welcome; // یا از prop دریافت کنید

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // ریست کردن وضعیت ویدیو وقتی مودال باز می‌شود
      setVideoLoaded(false);
      setVideoError(false);
      setHasPlayed(false);
      setIsPlaying(false);
      setProgress(0);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleVideoEnd = () => {
    setHasPlayed(true);
    setIsPlaying(false);
    toast.success('ویدیوی خوش‌آمدگویی مشاهده شد! حالا آماده یادگیری هستید 🎓');
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration) {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);
      
      // اگر بیش از 90% ویدیو دیده شده باشد، آن را کامل شده در نظر بگیر
      if (currentProgress >= 90 && !hasPlayed) {
        setHasPlayed(true);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(error => {
          console.error('خطا در پخش ویدیو:', error);
          toast.error('خطا در پخش ویدیو. لطفاً دوباره تلاش کنید');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedData = () => {
    setVideoLoaded(true);
    toast.info('ویدیو آماده پخش است');
  };

  const handleVideoError = () => {
    console.error('خطا در بارگذاری ویدیو');
    setVideoError(true);
    toast.error('خطا در بارگذاری ویدیو. لطفاً صفحه را رفرش کنید');
  };

  const handleRetryVideo = () => {
    if (videoRef.current) {
      setVideoError(false);
      setVideoLoaded(false);
      videoRef.current.load();
    }
  };

  const handleExploreDashboard = () => {
    onClose();
    toast.info('در حال انتقال به داشبورد...');
    // یک رفرش کوچک برای اطمینان از لود کامل داشبورد
    setTimeout(() => {
      router.refresh();
    }, 100);
  };

  const handleCompleteAndGo = () => {
    if (hasPlayed) {
      onClose();
      toast.success('آماده یادگیری هستید! موفق باشید 🚀');
    } else {
      toast.warning('لطفاً ابتدا ویدیو را مشاهده کنید');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-white dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-500">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute left-4 top-4 z-10 p-2 rounded-full bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300 dark:hover:bg-gray-600/80 transition-all duration-300 border border-gray-300 dark:border-gray-600"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Content */}
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">

              {/* Video Info */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  ویدیوی راهنمای شروع
                </span>
              </div>

              <h2 className="mt-5 text-sm font-bold text-gray-900 dark:text-white mb-2">
                {userName} عزیز، به پلتفرم یادگیری انگلیسی خوش آمدید! 🎉
              </h2>


            </div>

            {/* Video Container */}
            <div className="mb-6">
              <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20 border border-gray-300 dark:border-gray-700">
                {videoError ? (
                  <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-8">
                    <div className="text-red-500 mb-4">
                      <X className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      خطا در بارگذاری ویدیو
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4">
                      متأسفانه ویدیو بارگذاری نشد
                    </p>
                    <button
                      onClick={handleRetryVideo}
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-300 flex items-center gap-2"
                    >
                      <RotateCw className="h-4 w-4" />
                      تلاش مجدد
                    </button>
                  </div>
                ) : !videoLoaded ? (
                  <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 text-sm">در حال بارگذاری ویدیو...</p>
                    </div>
                  </div>
                ) : null}
                
                <video
             
                  ref={videoRef}
                  className="h-60vh w-full aspect-video object-cover cursor-pointer"
                  onClick={handlePlayPause}
                  onEnded={handleVideoEnd}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedData={handleLoadedData}
                  onError={handleVideoError}
                  preload="metadata"
                  controls
                >
                  <source src={videoUrl} type="video/mp4" />
                  <p className="text-center p-8">
                    مرورگر شما از تگ ویدیو پشتیبانی نمی‌کند.
                    <a href={videoUrl} className="text-blue-500 hover:underline">
                      برای دانلود ویدیو اینجا کلیک کنید
                    </a>
                  </p>
                </video>
                
                {/* Custom Play Button */}
                {!isPlaying && videoLoaded && !videoError && (
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-all duration-300 group"
                  >
                    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <Play className="h-10 w-10 text-white ml-1" />
                    </div>
                  </button>
                )}

                {/* Progress Bar */}
                {videoLoaded && !videoError && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700/30">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

         
            </div>


          </div>
        </div>
      </div>
    </>
  );
}