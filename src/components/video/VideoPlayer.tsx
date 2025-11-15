// components/video/VideoPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import VocabularyList from "./VocabularyList";

export type Subtitle = {
  id: string;
  startTime: number;
  endTime: number;
  englishText: string;
  persianText: string;
};

export type Vocabulary = {
  id: string;
  word: string;
  meaning: string;
};

type VideoPlayerProps = {
  videoUrl: string;
  subtitles: Subtitle[];
  vocabularies: Vocabulary[];
};

export default function VideoPlayer({ videoUrl, subtitles, vocabularies }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"subtitles" | "vocabulary">("subtitles");

  // ویدیو: گرفتن زمان فعلی
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  // تشخیص زیرنویس فعال
  useEffect(() => {
    const index = subtitles.findIndex(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    setActiveSubtitleIndex(index);
  }, [currentTime, subtitles]);

  // اسکرول فقط لیست زیرنویس‌ها
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

      {/* Video (همیشه ثابت در بالا) */}
      <div className="w-full flex items-center justify-center p-4 bg-black shadow-lg">
        <div className="relative rounded-xl overflow-hidden shadow-2xl bg-black aspect-video w-full max-w-4xl">
          <video
            ref={videoRef}
            controls
            src="\test-video.mp4"
            className="w-full h-full"
          >
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
            {subtitles.length ? (
              subtitles.map((subtitle, index) => (
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
