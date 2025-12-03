import { Subtitle, SubtitleSettings } from '../types';

interface VideoSubtitlesProps {
  activeSubtitle: Subtitle | null;
  subtitleSettings: SubtitleSettings;
  showControls: boolean;
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
            className={`inline-block px-0.75 py-0.5 m-[1.5px] rounded-md border border-white/20 backdrop-blur-sm transition-all duration-200 ${
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

export default function VideoSubtitles({
  activeSubtitle,
  subtitleSettings,
  showControls,
  onWordClick
}: VideoSubtitlesProps) {
  if (!activeSubtitle || subtitleSettings.mode === "none") {
    return null;
  }

  return (
    <div className={`absolute left-0 right-0 text-center z-10 px-1 pointer-events-none transition-all duration-300 ease-out ${showControls ? 'bottom-[60px]' : 'bottom-4'}`}>
      <div className="flex flex-col items-center gap-1">
        {["both", "english"].includes(subtitleSettings.mode) && (
          <div dir="ltr" className="mb-1">
            <ClickableText 
              text={activeSubtitle.englishText} 
              settings={subtitleSettings}
              onWordClick={onWordClick}
            />
          </div>
        )}
        {["both", "persian"].includes(subtitleSettings.mode) && (
          <div dir="rtl">
            <ClickableText 
              text={activeSubtitle.persianText} 
              settings={subtitleSettings}
              onWordClick={onWordClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}