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
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">

      {/* Video Container با طراحی سینمایی */}
      <div className="w-full flex items-center justify-center p-4 bg-black">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 aspect-video w-full max-w-4xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 z-10 pointer-events-none"></div>
          <video
            ref={videoRef}
            controls
            src="/test-video.mp4"
            className="w-full h-full relative z-0"
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

      {/* Tabs با طراحی مدرن */}
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

      {/* Scrollable Content با طراحی لوکس */}
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
                  {/* افکت نور پس‌زمینه برای آیتم فعال */}
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
                      {subtitle.englishText}
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
                  
                  {/* افکت درخشان در هاور */}
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

        {activeTab === "vocabulary" && <VocabularyList vocabularies={vocabularies} />}
      </div>

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