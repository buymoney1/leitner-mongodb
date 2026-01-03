// components/SubtitleList.tsx
import { useRef, useEffect } from 'react';
import { formatTime } from '../utils';
import { Subtitle, SubtitleSettings } from '../../types';

interface SubtitleListProps {
  subtitles: Subtitle[];
  activeSubtitle: Subtitle | null;
  subtitleSettings: SubtitleSettings;
  videoHeight: number;
  onSubtitleJump: (time: number) => void;
  onWordClick: (word: string) => void;
}

interface ClickableTextProps {
  text: string;
  settings: SubtitleSettings;
  onWordClick: (word: string) => void;
  isPersian?: boolean;
}

const ClickableText = ({ text, settings, onWordClick, isPersian = true }: ClickableTextProps) => {
  const words = text.split(/\s+/);
  
  // تعیین رنگ متن بر اساس mode
  const getTextColor = () => {
    // اگر رنگ سفید است و در لایت مود هستیم، از رنگ تیره استفاده کن
    if (settings.textColor === 'white' || settings.textColor === '#ffffff') {
      return isPersian 
        ? 'text-gray-800 dark:text-white' 
        : 'text-gray-700 dark:text-gray-300';
    }
    
    // اگر رنگ سیاه است و در دارک مود هستیم، از رنگ روشن استفاده کن
    if (settings.textColor === 'black' || settings.textColor === '#000000') {
      return isPersian 
        ? 'text-gray-800 dark:text-white' 
        : 'text-gray-700 dark:text-gray-300';
    }
    
    // در غیر این صورت از رنگ تنظیم شده استفاده کن
    return '';
  };

  return (
    <>
      {words.map((word, index) => {
        const cleanWord = word.replace(/[^a-zA-Z]/g, '');
        const isEnglishWord = cleanWord.length > 2 && /^[a-zA-Z]+$/.test(cleanWord);
        
        return (
          <span
            key={index}
            onClick={() => isEnglishWord && onWordClick(cleanWord)}
            style={{ 
              // فقط اگر رنگ سفید یا سیاه نبود، از رنگ تنظیم شده استفاده کن
              color: (settings.textColor === 'white' || settings.textColor === 'black' || 
                      settings.textColor === '#ffffff' || settings.textColor === '#000000') 
                      ? undefined 
                      : settings.textColor,
              fontSize: '13px',
              cursor: isEnglishWord ? 'pointer' : 'default'
            }}
            className={`inline-block transition-all duration-200 mx-0.5 ${getTextColor()} ${
              isEnglishWord 
                ? 'hover:text-blue-600 dark:hover:text-blue-400 hover:underline hover:underline-offset-2' 
                : ''
            }`}
          >
            {word}
          </span>
        );
      })}
    </>
  );
};

export default function SubtitleList({
  subtitles,
  activeSubtitle,
  subtitleSettings,
  videoHeight,
  onSubtitleJump,
  onWordClick
}: SubtitleListProps) {
  const subtitlesContainerRef = useRef<HTMLDivElement>(null);
  const activeSubtitleRef = useRef<HTMLDivElement>(null);

  // اسکرول به زیرنویس فعال
  useEffect(() => {
    if (activeSubtitle && activeSubtitleRef.current && subtitlesContainerRef.current) {
      const container = subtitlesContainerRef.current;
      const activeElement = activeSubtitleRef.current;
      
      setTimeout(() => {
        const elementTop = activeElement.offsetTop;
        const elementHeight = activeElement.offsetHeight;
        const containerHeight = container.clientHeight;
        
        // قرار دادن در یک‌چهارم بالایی کانتینر
        const scrollPosition = elementTop - (containerHeight / 8) + (elementHeight / 2);
        
        container.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [activeSubtitle]);

  return (
    <div 
      ref={subtitlesContainerRef}
      className="relative w-full bg-white dark:bg-gray-900 overflow-y-auto"
      style={{ 
        height: `calc(100vh - ${videoHeight}px)`
      }}
    >
      <div className="px-3 py-3 space-y-3">
        {subtitleSettings.mode === "none" && (
          <div className="inline-flex items-center px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/30">
            <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">
              زیرنویس غیرفعال
            </span>
          </div>
        )}
      
        {subtitles.length > 0 ? (
          <div className="space-y-3">
            {subtitles.map((sub, i) => {
              const isActive = sub === activeSubtitle;
              return (
                <div
                  key={i}
                  ref={isActive ? activeSubtitleRef : null}
                  onClick={() => onSubtitleJump(sub.startTime)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500 dark:border-blue-400 border-l border-t border-b border-gray-200 dark:border-gray-700 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded">
                      {formatTime(sub.startTime)}
                    </span>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>پخش</span>
                      </span>
                    )}
                  </div>
                  
                  <div className={`text-sm leading-relaxed mb-1.5 tracking-wide ${isActive ? 'font-medium' : ''}`}>
                    <ClickableText 
                      text={sub.persianText} 
                      settings={subtitleSettings}
                      onWordClick={onWordClick}
                      isPersian={true}
                    />
                  </div>
                  
                  {subtitleSettings.mode === 'both' && sub.englishText && (
                    <div className="pt-2.5 mt-2.5 border-t border-gray-100 dark:border-gray-800/50">
                      <div dir="ltr" className="text-xs leading-relaxed tracking-wide">
                        <ClickableText 
                          text={sub.englishText} 
                          settings={subtitleSettings}
                          onWordClick={onWordClick}
                          isPersian={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 text-lg mb-2">📝</div>
            <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">در حال بارگذاری زیرنویس...</div>
            <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              لطفاً چند لحظه صبر کنید
            </div>
          </div>
        )}
      </div>
    </div>
  );
}