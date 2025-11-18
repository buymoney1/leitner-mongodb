// components/video/VideoPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import VocabularyList from "./VocabularyList";

// نوع Vocabulary بدون تغییر باقی می‌ماند
export type Vocabulary = {
  id: string;
  word: string;
  meaning: string;
};

// نوع Subtitle برای لیست پردازش‌شده زیر ویدیو
type ProcessedSubtitle = {
  id: string;
  startTime: number;
  endTime: number;
  englishText: string;
  persianText: string;
};

// نوع props کامپوننت تغییر می‌کند
type VideoPlayerProps = {
  videoUrl: string;
  subtitlesVtt: string | null;
  vocabularies: Vocabulary[];
};

// تابع کمکی برای تبدیل زمان VTT به ثانیه
const vttTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
};

// کامپوننت جدید برای نمایش اطلاعات دیکشنری
const DictionarySection = ({ word, onWordSelect }: { word: string; onWordSelect: (word: string) => void }) => {
  const [dictionaryData, setDictionaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (word.trim() && word.length > 2) {
      fetchDictionaryData(word);
    } else {
      setDictionaryData(null);
    }
  }, [word]);

  const fetchDictionaryData = async (searchWord: string) => {
    setIsLoading(true);
    try {
      // استفاده از Free Dictionary API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord.toLowerCase()}`);
      
      if (response.ok) {
        const data = await response.json();
        setDictionaryData(data[0]); // اولین نتیجه را بگیر
      } else {
        setDictionaryData(null);
      }
    } catch (error) {
      console.error("Dictionary API error:", error);
      setDictionaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!word.trim() || word.length < 3) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-white font-semibold">اطلاعات دیکشنری</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-cyan-400 text-sm mr-2">در حال دریافت اطلاعات...</span>
        </div>
      ) : dictionaryData ? (
        <div className="space-y-3">
          {/* تلفظ و نوع کلمه */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dictionaryData.phonetic && (
                <span className="text-gray-400 text-sm">/{dictionaryData.phonetic}/</span>
              )}
            </div>
            <div className="flex gap-2">
              {dictionaryData.meanings?.slice(0, 2).map((meaning: any, index: number) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg text-xs"
                >
                  {meaning.partOfSpeech}
                </span>
              ))}
            </div>
          </div>

          {/* معانی */}
          <div className="space-y-2">
            {dictionaryData.meanings?.slice(0, 3).map((meaning: any, meaningIndex: number) => (
              <div key={meaningIndex} className="border-r-2 border-cyan-500/30 pr-3">
                <p className="text-cyan-300 text-sm font-medium mb-1">
                  {meaning.partOfSpeech}
                </p>
                <ul className="space-y-1">
                  {meaning.definitions?.slice(0, 3).map((def: any, defIndex: number) => (
                    <li key={defIndex} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{def.definition}</span>
                    </li>
                  ))}
                </ul>
                
                {/* مثال‌ها */}
                {meaning.definitions?.[0]?.example && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded-lg border-r-2 border-purple-500/30">
                    <p className="text-purple-300 text-xs font-medium mb-1">مثال:</p>
                    <p className="text-gray-300 text-sm italic">"{meaning.definitions[0].example}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* مترادف‌ها */}
          {dictionaryData.meanings?.[0]?.synonyms && dictionaryData.meanings[0].synonyms.length > 0 && (
            <div className="pt-2 border-t border-gray-700/50">
              <p className="text-cyan-300 text-sm font-medium mb-2">مترادف‌ها:</p>
              <div className="flex flex-wrap gap-1">
                {dictionaryData.meanings[0].synonyms.slice(0, 5).map((synonym: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs hover:bg-gray-600/50 transition-colors cursor-pointer"
                    onClick={() => onWordSelect(synonym)}
                  >
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-sm">اطلاعاتی برای این کلمه یافت نشد</p>
        </div>
      )}
    </div>
  );
};

export default function VideoPlayer({ videoUrl, subtitlesVtt, vocabularies }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"subtitles" | "vocabulary">("subtitles");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [customWord, setCustomWord] = useState("");
  const [customMeaning, setCustomMeaning] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // State برای نگهداری زیرنویس‌های پردازش‌شده برای لیست زیر ویدیو
  const [processedSubtitles, setProcessedSubtitles] = useState<ProcessedSubtitle[]>([]);
  
  // State برای نگهداری URL موقت فایل VTT که به تگ <track> داده می‌شود
  const [vttTrackUrl, setVttTrackUrl] = useState<string | null>(null);

  // Effect 1: ساخت URL موقت برای تگ <track> هر زمان که متن VTT تغییر کرد
  useEffect(() => {
    if (subtitlesVtt) {
      const blob = new Blob([subtitlesVtt], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);
      setVttTrackUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVttTrackUrl(null);
    }
  }, [subtitlesVtt]);

  // Effect 2: پردازش متن VTT برای نمایش در لیست سفارشی
  useEffect(() => {
    if (!subtitlesVtt) {
      setProcessedSubtitles([]);
      return;
    }

    const lines = subtitlesVtt.split('\n');
    const parsedSubtitles: ProcessedSubtitle[] = [];
    
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === 'WEBVTT') {
        startIndex = i + 1;
        break;
      }
    }
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;
      
      if (line.includes('-->')) {
        const timeParts = line.split('-->');
        const startTime = vttTimeToSeconds(timeParts[0].trim());
        const endTime = vttTimeToSeconds(timeParts[1].trim());
        
        i++;
        const englishText = lines[i] ? lines[i].trim() : '';
        
        i++;
        const persianText = lines[i] ? lines[i].trim() : '';
        
        if (englishText) {
          parsedSubtitles.push({
            id: `subtitle-${parsedSubtitles.length}`,
            startTime,
            endTime,
            englishText,
            persianText
          });
        }
      }
    }
    
    setProcessedSubtitles(parsedSubtitles);
  }, [subtitlesVtt]);

  // Effect 3: همگام‌سازی زمان ویدیو با زیرنویس فعال
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  // Effect 4: تشخیص زیرنویس فعال برای هایلایت در لیست
  useEffect(() => {
    const index = processedSubtitles.findIndex(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    setActiveSubtitleIndex(index);
  }, [currentTime, processedSubtitles]);

  // Effect 5: اسکرول خودکار به زیرنویس فعال
  useEffect(() => {
    if (activeSubtitleIndex !== null && activeSubtitleIndex >= 0) {
      const element = document.getElementById(`subtitle-${activeSubtitleIndex}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeSubtitleIndex]);

  // Effect 6: وقتی کلمه انتخاب شد، معنی آن را بگیر
  useEffect(() => {
    if (selectedWord) {
      setCustomWord(selectedWord);
      autoTranslateWord(selectedWord);
    }
  }, [selectedWord]);

  // تابع برای ترجمه خودکار کلمه
  const autoTranslateWord = async (word: string) => {
    if (!word.trim()) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch(`/api/translate?text=${encodeURIComponent(word)}&target=fa`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomMeaning(data.translatedText || "");
      } else {
        // اگر API ترجمه کار نکرد، از لغت‌های موجود جستجو کن
        const existingVocab = vocabularies.find(v => 
          v.word.toLowerCase() === word.toLowerCase()
        );
        if (existingVocab) {
          setCustomMeaning(existingVocab.meaning);
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
      // در صورت خطا، از لغت‌های موجود جستجو کن
      const existingVocab = vocabularies.find(v => 
        v.word.toLowerCase() === word.toLowerCase()
      );
      if (existingVocab) {
        setCustomMeaning(existingVocab.meaning);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // تابع برای استخراج کلمات از متن
  const extractWords = (text: string): string[] => {
    const words = text.split(/\s+/);
    const englishWords: string[] = [];
    
    words.forEach(word => {
      // حذف تمام کاراکترهای غیر انگلیسی
      const cleanWord = word.replace(/[^a-zA-Z]/g, '');
      
      // فقط کلمات انگلیسی با حداقل ۳ حرف
      if (cleanWord.length > 2 && /^[a-zA-Z]+$/.test(cleanWord)) {
        englishWords.push(cleanWord);
      }
    });
    
    return englishWords;
  };

  // تابع برای کلیک روی کلمه
  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  // تابع برای انتخاب کلمه از مترادف‌ها
  const handleWordSelect = (word: string) => {
    setCustomWord(word);
    autoTranslateWord(word);
  };

  // تابع برای افزودن کارت
  const handleAddToFlashcards = async () => {
    if (!customWord.trim() || !customMeaning.trim()) {
      alert("لطفاً هم کلمه و هم معنی را وارد کنید.");
      return;
    }

    setIsAddingCard(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          front: customWord.trim(), 
          back: customMeaning.trim() 
        }),
      });

      if (response.ok) {
        alert("کارت با موفقیت به فلش‌کارت‌ها اضافه شد!");
        setSelectedWord(null);
        setCustomWord("");
        setCustomMeaning("");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در افزودن کارت.");
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور.");
    } finally {
      setIsAddingCard(false);
    }
  };

  // تابع برای ترجمه دستی
  const handleManualTranslate = async () => {
    if (customWord.trim()) {
      await autoTranslateWord(customWord.trim());
    }
  };

  // کامپوننت برای نمایش کلمات قابل کلیک
  const ClickableText = ({ text }: { text: string }) => {
    const words = extractWords(text);
    
    if (words.length === 0) {
      return <span>{text}</span>;
    }

    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    words.forEach((word, index) => {
      const wordStart = text.indexOf(word, lastIndex);
      
      // اضافه کردن متن قبل از کلمه
      if (wordStart > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, wordStart)}
          </span>
        );
      }
      
      // اضافه کردن کلمه قابل کلیک
      elements.push(
        <span
          key={`word-${index}`}
          onClick={() => handleWordClick(word)}
          className="cursor-pointer hover:text-cyan-300 hover:bg-cyan-500/20 px-1 rounded transition-all duration-200 border-b border-dashed border-cyan-500/50"
          title="کلیک برای افزودن به فلش‌کارت"
        >
          {word}
        </span>
      );
      
      lastIndex = wordStart + word.length;
    });

    // اضافه کردن متن باقی‌مانده
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-final">
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <>{elements}</>;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      {/* Video Container */}
      <div className="w-full flex items-center justify-center p-4 bg-black">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 aspect-video w-full max-w-4xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 z-10 pointer-events-none"></div>
          <video
            ref={videoRef}
            controls
            src="/test-video.mp4"
            className="w-full h-full relative z-0"
          >
            {vttTrackUrl && (
              <track
                kind="subtitles"
                src={vttTrackUrl}
                srcLang="en"
                label="English & Persian"
                default
              />
            )}
            Your browser does not support HTML5 video.
          </video>
        </div>
      </div>

{selectedWord && (
  <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 rounded-2xl backdrop-blur-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="text-center">
          <p className="text-white font-bold text-xl mb-3">افزودن به فلش‌کارت</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-popup-scrollbar">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">کلمه انگلیسی:</label>
            <input
              type="text"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              placeholder="کلمه انگلیسی را وارد کنید..."
              className="w-full p-3 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white text-sm font-medium">معنی فارسی:</label>
              <button
                onClick={handleManualTranslate}
                disabled={isTranslating || !customWord.trim()}
                className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1 disabled:opacity-50"
              >
                {isTranslating ? (
                  <>
                    <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    در حال ترجمه...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    ترجمه خودکار
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={customMeaning}
              onChange={(e) => setCustomMeaning(e.target.value)}
              placeholder={isTranslating ? "در حال ترجمه..." : "معنی فارسی را وارد کنید..."}
              className="w-full p-3 rounded-xl bg-gray-900/80 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
              onKeyPress={(e) => e.key === 'Enter' && handleAddToFlashcards()}
              disabled={isTranslating}
            />
            {isTranslating && (
              <p className="text-cyan-400 text-xs flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                در حال ترجمه خودکار...
              </p>
            )}
          </div>

          {/* بخش دیکشنری */}
          <DictionarySection word={customWord} onWordSelect={handleWordSelect} />
        </div>
      </div>

      {/* Footer - دکمه‌ها */}
      <div className="mb-7 flex-shrink-0 p-6 pt-4 border-t border-gray-700/50">
        <div className="flex gap-3 ">
          <button 
            onClick={handleAddToFlashcards}
            disabled={isAddingCard || !customWord.trim() || !customMeaning.trim()}
            className={`flex-1 py-3 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isAddingCard || !customWord.trim() || !customMeaning.trim()
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25"
            }`}
          >
            {isAddingCard ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                در حال افزودن...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                افزودن به فلش‌کارت
              </>
            )}
          </button>
          
          <button 
            onClick={() => {
              setSelectedWord(null);
              setCustomWord("");
              setCustomMeaning("");
            }}
            className="px-6 py-3 rounded-xl bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Tabs */}
      <div className="px-4 pt-2">
        <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800 shadow-lg">
          <button
            onClick={() => setActiveTab("subtitles")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
              activeTab === "subtitles"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white bg-transparent"
            }`}
          >
            {activeTab === "subtitles" && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"></div>
            )}
            <span className="relative z-10">زیرنویس‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab("vocabulary")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
              activeTab === "vocabulary"
                ? "bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white bg-transparent"
            }`}
          >
            {activeTab === "vocabulary" && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"></div>
            )}
            <span className="relative z-10">لغت‌ها</span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-black p-4 overflow-y-auto custom-scrollbar">
        {activeTab === "subtitles" && (
          <div className="space-y-3">
            {processedSubtitles.length ? (
              processedSubtitles.map((subtitle, index) => (
                <div
                  key={subtitle.id}
                  id={`subtitle-${index}`}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                    index === activeSubtitleIndex
                      ? "bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border-cyan-400/50 shadow-xl scale-[1.02]"
                      : "bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 hover:border-gray-600"
                  }`}
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = subtitle.startTime;
                    }
                  }}
                >
                  {index === activeSubtitleIndex && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 z-0"></div>
                  )}
                  
                  <div className="relative z-10">
                    <p
                      className={`font-medium mb-2 leading-relaxed ${
                        index === activeSubtitleIndex 
                          ? "text-cyan-200" 
                          : "text-gray-200 group-hover:text-white"
                      }`}
                    >
                      <ClickableText text={subtitle.englishText} />
                    </p>
                    <p
                      className={`text-sm leading-relaxed ${
                        index === activeSubtitleIndex 
                          ? "text-gray-100" 
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    >
                      {subtitle.persianText}
                    </p>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-500 z-0"></div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <div className="text-gray-500 text-lg mb-2">زیرنویسی موجود نیست</div>
                <div className="text-gray-600 text-sm">ویدیو فاقد زیرنویس است</div>
              </div>
            )}
          </div>
        )}

        {activeTab === "vocabulary" && (
          <VocabularyList 
            vocabularies={vocabularies} 
            onWordClick={handleWordClick}
          />
        )}
      </div>


      // در انتهای کامپوننت VideoPlayer، استایل‌های زیر را اضافه کنید:
<style jsx>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.5);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #0891b2, #7c3aed);
  }

  /* استایل مخصوص اسکرول بار پاپ‌آپ */
  .custom-popup-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.3);
    border-radius: 10px;
    margin: 4px 0;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
    border-radius: 10px;
  }
  .custom-popup-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #0891b2, #7c3aed);
  }
`}</style>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }
      `}</style>
    </div>
  );
}