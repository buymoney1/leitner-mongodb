// components/video/VideoSubtitles.tsx
'use client';

import { Subtitle, SubtitleSettings } from "../../types";

interface VideoSubtitlesProps {
  activeSubtitle: Subtitle | null;
  subtitleSettings: SubtitleSettings;
  showControls: boolean;
  onWordClick: (word: string) => void;
}

export default function VideoSubtitles({
  activeSubtitle,
  subtitleSettings,
  showControls,
  onWordClick
}: VideoSubtitlesProps) {
  if (!activeSubtitle || subtitleSettings.mode === "none") {
    return null;
  }

  // تابع اصلی برای کلیک روی کلمه
  const handleWordClick = (word: string) => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length > 2 && /^[a-zA-Z]+$/.test(cleanWord)) {
      console.log('Word clicked in VideoSubtitles:', cleanWord);
      onWordClick(cleanWord);
    }
  };

  // رندر هر کلمه با event handler مستقیم
  const renderText = (text: string) => {
    const words = text.split(/\s+/);
    
    return words.map((word, index) => {
      const cleanWord = word.replace(/[^a-zA-Z]/g, '');
      const isEnglishWord = cleanWord.length > 2 && /^[a-zA-Z]+$/.test(cleanWord);
      
      if (isEnglishWord) {
        return (
          <span
            key={index}
            onClick={() => handleWordClick(word)}
            style={{ 
              backgroundColor: subtitleSettings.backgroundColor, 
              color: subtitleSettings.textColor, 
              fontSize: `${subtitleSettings.fontSize}px`
            }}
            className="inline-block px-1 mx-0.5 rounded hover:bg-blue-500/80 cursor-pointer hover:scale-105 transition-all duration-200"
          >
            {word}
          </span>
        );
      }
      
      return (
        <span
          key={index}
          style={{ 
            backgroundColor: subtitleSettings.backgroundColor, 
            color: subtitleSettings.textColor, 
            fontSize: `${subtitleSettings.fontSize}px`
          }}
          className="inline-block px-1 mx-0.5 rounded"
        >
          {word}
        </span>
      );
    });
  };

  const subtitlePosition = showControls ? 'bottom-20' : 'bottom-8';

  return (
    <div className={`absolute left-0 right-0 text-center z-30 px-4 transition-all duration-300 ${subtitlePosition}`}>
      <div className="flex flex-col items-center gap-1">
        {["both", "english"].includes(subtitleSettings.mode) && (
          <div dir="ltr" className="mb-1">
            {renderText(activeSubtitle.englishText)}
          </div>
        )}
        {["both", "persian"].includes(subtitleSettings.mode) && (
          <div dir="rtl">
            {renderText(activeSubtitle.persianText)}
          </div>
        )}
      </div>
    </div>
  );
}