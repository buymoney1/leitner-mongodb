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
}

const ClickableText = ({ text, settings, onWordClick }: ClickableTextProps) => {
  const words = text.split(/\s+/);
  
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
              color: settings.textColor,
              fontSize: '13px',
              cursor: isEnglishWord ? 'pointer' : 'default'
            }}
            className={`inline-block transition-all duration-200 mx-0.5 ${
              isEnglishWord 
                ? 'hover:text-blue-600 dark:hover:text-blue-400 hover:underline' 
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
        
        const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);
        
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
      className="relative w-full bg-white dark:bg-gray-900"
      style={{ 
        height: `calc(100vh - ${videoHeight}px)`,
        overflowY: 'auto'
      }}
    >
      <div className="px-3 py-3 space-y-3">
        {subtitleSettings.mode === "none" && (
          <span className="text-xs text-orange-600 dark:text-orange-400 px-2 py-1 rounded">
            زیرنویس غیرفعال
          </span>
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
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {formatTime(sub.startTime)}
                    </span>
                    {isActive && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        ● پخش
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm leading-relaxed mb-1.5 tracking-wide ${isActive ? 'font-medium' : ''}`}>
                    <ClickableText 
                      text={sub.persianText} 
                      settings={subtitleSettings}
                      onWordClick={onWordClick}
                    />
                  </p>
                  
                  {subtitleSettings.mode === 'both' && sub.englishText && (
                    <div className="pt-2.5 mt-2.5 border-t border-gray-100 dark:border-gray-800">
                      <p dir="ltr" className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed tracking-wide">
                        <ClickableText 
                          text={sub.englishText} 
                          settings={subtitleSettings}
                          onWordClick={onWordClick}
                        />
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 text-sm mb-2">📝</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">در حال بارگذاری زیرنویس...</div>
          </div>
        )}
      </div>
    </div>
  );
}