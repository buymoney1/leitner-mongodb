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
  subtitlesVtt: string | null; // به جای آرایه، رشته VTT را دریافت می‌کند
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

export default function VideoPlayer({ videoUrl, subtitlesVtt, vocabularies }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"subtitles" | "vocabulary">("subtitles");
  
  // State برای نگهداری زیرنویس‌های پردازش‌شده برای لیست زیر ویدیو
  const [processedSubtitles, setProcessedSubtitles] = useState<ProcessedSubtitle[]>([]);
  
  // State برای نگهداری URL موقت فایل VTT که به تگ <track> داده می‌شود
  const [vttTrackUrl, setVttTrackUrl] = useState<string | null>(null);

  // Effect 1: ساخت URL موقت برای تگ <track> هر زمان که متن VTT تغییر کرد
  useEffect(() => {
    if (subtitlesVtt) {
      // یک Blob از محتوای VTT می‌سازیم
      const blob = new Blob([subtitlesVtt], { type: 'text/vtt' });
      // یک URL موقت برای این Blob می‌سازیم
      const url = URL.createObjectURL(blob);
      setVttTrackUrl(url);

      // تابع Cleanup برای آزادسازی حافظه وقتی کامپوننت از بین می‌رود یا زیرنویس‌ها عوض می‌شوند
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
    
    // پیدا کردن شروع محتوای VTT (بعد از WEBVTT)
    let startIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === 'WEBVTT') {
        startIndex = i + 1;
        break;
      }
    }
    
    // پردازش خطوط VTT
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
  }, [subtitlesVtt]); // این افکت فقط وقتی subtitlesVtt تغییر کند دوباره اجرا می‌شود

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

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-gray-800 shadow-lg">
        <h1 className="text-xl font-bold text-white">Video Player</h1>
        <button
          onClick={() => window.history.back()}
          className="text-gray-300 hover:text-white text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      {/* Video Container */}
      <div className="w-full flex items-center justify-center p-4 bg-black shadow-lg">
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black aspect-video w-full max-w-4xl">
          <video
            ref={videoRef}
            controls
            src="/test-video.mp4"
            className="w-full h-full"
          >
            {/* استفاده از URL موقتی که ساختیم */}
            {vttTrackUrl && (
              <track
                kind="subtitles"
                src={vttTrackUrl}
                srcLang="en" // زبان متن اصلی
                label="English & Persian"
                default
              />
            )}
            Your browser does not support HTML5 video.
          </video>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex bg-gray-800 rounded-t-lg p-1">
          <button
            onClick={() => setActiveTab("subtitles")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "subtitles"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            زیرنویس‌ها
          </button>

          <button
            onClick={() => setActiveTab("vocabulary")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "vocabulary"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            لغت‌ها
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 bg-gray-800 rounded-b-lg p-4 overflow-y-auto custom-scrollbar">
        {activeTab === "subtitles" && (
          <div className="space-y-3">
            {processedSubtitles.length ? (
              processedSubtitles.map((subtitle, index) => (
                <div
                  key={subtitle.id}
                  id={`subtitle-${index}`}
                  className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                    index === activeSubtitleIndex
                      ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-400 shadow-lg scale-105"
                      : "bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  }`}
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = subtitle.startTime;
                    }
                  }}
                >
                  <p
                    className={`font-semibold mb-1 ${
                      index === activeSubtitleIndex ? "text-cyan-300" : "text-gray-200"
                    }`}
                  >
                    {subtitle.englishText}
                  </p>
                  <p
                    className={`text-sm ${
                      index === activeSubtitleIndex ? "text-gray-100" : "text-gray-400"
                    }`}
                  >
                    {subtitle.persianText}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">زیرنویسی موجود نیست.</p>
            )}
          </div>
        )}

        {activeTab === "vocabulary" && <VocabularyList vocabularies={vocabularies} />}
      </div>

      {/* Scrollbar Style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #06b6d4;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0891b2;
        }
      `}</style>
    </div>
  );
}