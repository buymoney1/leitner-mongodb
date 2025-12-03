import { useRef, useEffect } from 'react';
import { Subtitle, SubtitleSettings } from '../types';
import { formatTime } from '../utils';

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
              backgroundColor: settings.backgroundColor, 
              color: settings.textColor, 
              fontSize: `${settings.fontSize}px`,
              cursor: isEnglishWord ? 'pointer' : 'default'
            }}
            className={`inline-block px-1.5 py-0.5 m-[2px] rounded-md border border-white/20 backdrop-blur-sm transition-all duration-200 ${
              isEnglishWord 
                ? 'hover:scale-110 hover:bg-blue-500 pointer-events-auto' 
                : 'pointer-events-none'
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
      className="relative z-0 w-full bg-white"
      style={{ 
        height: `calc(100vh - ${videoHeight}px)`,
        overflowY: 'auto'
      }}
    >
      <div className="px-4 pt-4 pb-32 space-y-4">
        {subtitleSettings.mode === "none" && (
          <span className="text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-full border border-orange-200 font-medium">
            زیرنویس غیرفعال
          </span>
        )}
      
        {subtitles.length > 0 ? (
          <div className="space-y-4">
            {subtitles.map((sub, i) => {
              const isActive = sub === activeSubtitle;
              return (
                <div
                  key={i}
                  ref={isActive ? activeSubtitleRef : null}
                  onClick={() => onSubtitleJump(sub.startTime)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                    isActive 
                      ? 'bg-blue-50 border-blue-200 shadow-lg ring-2 ring-blue-100 transform scale-101' 
                      : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                      {formatTime(sub.startTime)}
                    </span>
                    {isActive && (
                      <span className="text-xs text-blue-600 font-bold bg-blue-100 px-3 py-1 rounded-full">
                        🔴 در حال پخش
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-base leading-8 mb-3 ${isActive ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                    <ClickableText 
                      text={sub.persianText} 
                      settings={subtitleSettings}
                      onWordClick={onWordClick}
                    />
                  </p>
                  
                  {subtitleSettings.mode === 'both' && sub.englishText && (
                    <div className="pt-3 border-t border-gray-100">
                      <p dir="ltr" className="text-sm text-gray-500 font-light leading-relaxed">
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
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">📝</div>
            <div className="text-gray-500 text-sm">در حال بارگذاری زیرنویس...</div>
          </div>
        )}
      </div>
    </div>
  );
}