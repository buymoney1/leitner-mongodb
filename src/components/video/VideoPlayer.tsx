// components/video/VideoPlayer.tsx
"use client";
import ReactPlayer from "react-player/lazy";
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { parseVTT } from "@/utils";
import { PlayerState, Subtitle, SubtitleSettings, VideoQuality, Vocabulary } from "../../../types";
import PlayerControls from "../PlayerControls";
import SaveWordPopup from "../SaveWordPopup";
import SettingsPanel from "../SettingsPanel";
import SubtitleList from "../SubtitleList";
import TabBar from "../TabBar";
import VideoSubtitles from "../VideoSubtitles";
import VocabularyList from "./VocabularyList";
import { ArrowLeft, Play, AlertCircle, Home } from 'lucide-react';
import Link from "next/link";

interface VideoPlayerProps {
  initialVideoData?: {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string;
    thumbnailUrl: string | null;
    level: string;
    subtitlesVtt: string | null;
    vocabularies: Vocabulary[];
  };
  episodeNumber?: number;
  seasonNumber?: number;
  seriesTitle?: string;
  videoId?: string; // اضافه کردن videoId به props
}

export default function VideoPlayer({ 
  initialVideoData, 
  episodeNumber,
  seasonNumber,
  seriesTitle,
  videoId 
}: VideoPlayerProps) {
  const router = useRouter();
  
  // --- State ---
  const [playerState, setPlayerState] = useState<PlayerState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    isFullScreen: false,
    showControls: true,
    videoHeight: 0
  });

  const [showFullDescription, setShowFullDescription] = useState(false);

  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<Subtitle | null>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [loading, setLoading] = useState(!initialVideoData);
  const [error, setError] = useState<string | null>(null);
  
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>({
    mode: "both",
    fontSize: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    textColor: "white"
  });
  
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("auto");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'subtitles' | 'vocabulary'>('subtitles');
  
  // State جدید برای مدیریت لغات
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showSavePopup, setShowSavePopup] = useState(false);

  // --- Refs ---
  const playerRef = useRef<ReactPlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- Effects ---
  useEffect(() => {
    // اگر initialVideoData داریم، از آن استفاده کن
    if (initialVideoData) {
      console.log('🎬 Using initial video data:', initialVideoData.title);
      processVideoData(initialVideoData);
      setLoading(false);
      return;
    }

    // در غیر این صورت از API بگیر
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        console.log('📡 Fetching video data for ID:', videoId);
        
        if (!videoId) {
          throw new Error('شناسه ویدیو نامعتبر است');
        }
        
        const response = await fetch(`/api/videos/${videoId}`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('ویدیو یافت نشد');
          }
          throw new Error(`خطا در دریافت ویدیو: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Video data received:', data);
        
        if (!data || !data.id) {
          throw new Error('داده‌های ویدیو نامعتبر است');
        }
        
        processVideoData(data);
        
      } catch (error) {
        console.error("Error loading video:", error);
        setError(error instanceof Error ? error.message : 'خطا در بارگذاری ویدیو');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoData();
    } else {
      setError('شناسه ویدیو نامعتبر است');
      setLoading(false);
    }
  }, [initialVideoData, videoId]);

  // تابع برای پردازش داده‌های ویدیو
  const processVideoData = (data: any) => {
    setVideoData(data);
    
    // بارگذاری زیرنویس از دیتابیس
    if (data.subtitlesVtt) {
      console.log('Parsing subtitles...');
      try {
        const parsedSubtitles = parseVTT(data.subtitlesVtt);
        console.log('Subtitles parsed:', parsedSubtitles.length, 'entries');
        setSubtitles(parsedSubtitles);
      } catch (parseError) {
        console.error('Error parsing subtitles:', parseError);
        // اگر زیرنویس مشکل داشت، لیست خالی بگذار
        setSubtitles([]);
      }
    } else {
      console.log('No subtitles available for this video');
      setSubtitles([]);
    }
    
    // بارگذاری لغات از دیتابیس
    if (data.vocabularies && data.vocabularies.length > 0) {
      console.log('Vocabularies found:', data.vocabularies.length);
      const formattedVocabularies: Vocabulary[] = data.vocabularies.map((vocab: any) => ({
        id: vocab.id,
        word: vocab.word,
        meaning: vocab.meaning,
        videoId: data.id
      }));
      setVocabularies(formattedVocabularies);
    } else {
      console.log('No vocabularies available for this video');
      setVocabularies([]);
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => 
      setPlayerState(prev => ({ ...prev, isFullScreen: !!document.fullscreenElement }));
    
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
  }, []);

  // محاسبه ارتفاع ویدیو
  useEffect(() => {
    const updateVideoHeight = () => {
      if (playerContainerRef.current) {
        setPlayerState(prev => ({ 
          ...prev, 
          videoHeight: playerContainerRef.current!.offsetHeight 
        }));
      }
    };

    updateVideoHeight();
    window.addEventListener('resize', updateVideoHeight);
    
    return () => window.removeEventListener('resize', updateVideoHeight);
  }, []);

  // --- Handlers ---
  const toggleFullScreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setPlayerState(prev => ({ ...prev, showControls: true }));
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerState.playing && !showSettings && !showSavePopup) {
        setPlayerState(prev => ({ ...prev, showControls: false }));
      }
    }, 3000);
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    setPlayerState(prev => ({ ...prev, currentTime: state.playedSeconds }));
    const sub = subtitles.find(s => state.playedSeconds >= s.startTime && state.playedSeconds < s.endTime);
    setActiveSubtitle(sub || null);
  };

  const handleSubtitleJump = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, 'seconds');
      setPlayerState(prev => ({ ...prev, playing: true }));
    }
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setShowSavePopup(true);
    // وقتی پاپ‌آپ باز است، کنترل‌ها را نشان بده
    setPlayerState(prev => ({ ...prev, showControls: true }));
  };

  const handleSaveWord = async (word: string, meaning: string) => {
    try {
      // ارسال به API
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: word.trim(),
          back: meaning.trim(),
          type: "vocabulary"
        }),
      });

      if (!response.ok) {
        throw new Error("خطا در ذخیره کارت");
      }

      const savedCard = await response.json();

      // اضافه کردن به لیست محلی
      const newVocabulary: Vocabulary = {
        id: savedCard.id || Date.now().toString(),
        word: word.trim(),
        meaning: meaning.trim()
      };
      
      setVocabularies(prev => [...prev, newVocabulary]);
      
      console.log("Word saved successfully:", { word, meaning, savedCard });
      
    } catch (error) {
      console.error("Error saving word to API:", error);
      throw error;
    }
  };

  const handleRemoveWord = async (id: string) => {
    try {
      // حذف از API
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("خطا در حذف کارت");
      }

      // حذف از لیست محلی
      setVocabularies(prev => prev.filter(v => v.id !== id));
      
      console.log("Word removed successfully:", id);
      
    } catch (error) {
      console.error("Error removing word from API:", error);
      // حتی اگر API خطا داد، از لیست محلی حذف کن
      setVocabularies(prev => prev.filter(v => v.id !== id));
    }
  };

  const updatePlayerState = (updates: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  };

  const handleClosePopup = () => {
    setShowSavePopup(false);
    setSelectedWord(null);
  };

  // ساخت عنوان کامل
  const getFullTitle = () => {
    if (!videoData) return '';
    
    let title = videoData.title;
    
    // اگر اطلاعات سریال داریم، به عنوان اضافه کنیم
    if (seasonNumber && episodeNumber) {
      title = `فصل ${seasonNumber}، قسمت ${episodeNumber}: ${title}`;
    }
    
    if (seriesTitle) {
      title = `${seriesTitle} - ${title}`;
    }
    
    return title;
  };

  // نمایش loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری ویدیو...</p>
        </div>
      </div>
    );
  }

  // نمایش خطا
  if (error || !videoData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'ویدیو یافت نشد'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            متأسفانه ویدیو مورد نظر در دسترس نیست یا حذف شده است.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              بازگشت
            </button>
            <Link
              href="/video-levels"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // اگر ویدیو URL ندارد
  if (!videoData.videoUrl) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            لینک ویدیو موجود نیست
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            برای این ویدیو لینک پخش تنظیم نشده است.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              بازگشت
            </button>
            <Link
              href="/video-levels"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fullTitle = getFullTitle();

  return (
    <div className="w-full max-w-[900px] mx-auto font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" dir="rtl">
      
      {/* ویدیو پلیر */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-black dark:bg-gray-900 shadow-2xl">
        <div className="w-full max-w-[800px] mx-auto">
          <div 
            ref={playerContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => playerState.playing && !showSettings && !showSavePopup && updatePlayerState({ showControls: false })}
            className={`
              relative bg-black flex justify-center items-center transition-all duration-300 overflow-hidden
              ${playerState.isFullScreen ? 'w-full h-screen' : 'w-full aspect-video'}
            `}
          >
            <div className="absolute inset-0 z-0" onClick={() => {
              if (!showSavePopup) {
                updatePlayerState({ playing: !playerState.playing });
              }
            }}></div>

            <ReactPlayer
              ref={playerRef}
              url={videoData.videoUrl}
              playing={playerState.playing}
              controls={false}
              width="100%"
              height="100%"
              onProgress={handleProgress}
              onDuration={(duration) => updatePlayerState({ duration })}
              onEnded={() => updatePlayerState({ playing: false })}
              config={{ file: { attributes: { controlsList: 'nodownload' } } }}
            />

            {/* زیرنویس روی ویدیو */}
            <VideoSubtitles
              activeSubtitle={activeSubtitle}
              subtitleSettings={subtitleSettings}
              showControls={playerState.showControls}
              onWordClick={handleWordClick}
            />

            {/* نوار کنترل */}
            <PlayerControls
              playing={playerState.playing}
              currentTime={playerState.currentTime}
              duration={playerState.duration}
              isFullScreen={playerState.isFullScreen}
              showControls={playerState.showControls && !showSavePopup}
              onPlayPause={() => updatePlayerState({ playing: !playerState.playing })}
              onSeek={(time) => {
                updatePlayerState({ currentTime: time });
                if (playerRef.current) {
                  playerRef.current.seekTo(time, 'seconds');
                }
              }}
              onFullScreen={toggleFullScreen}
              onShowSettings={() => setShowSettings(true)}
            />

            {/* پاپ‌آپ ذخیره لغت - داخل ویدیو پلیر */}
            {showSavePopup && selectedWord && (
              <div className="fixed absolute inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 dark:bg-gray-900/90 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                  <SaveWordPopup
                    word={selectedWord}
                    onClose={handleClosePopup}
                    onSave={handleSaveWord}
                  />
                </div>
              </div>
            )}

            {/* پنل تنظیمات */}
            <SettingsPanel
              isOpen={showSettings}
              activeTab={activeTab}
              subtitleSettings={subtitleSettings}
              videoQuality={videoQuality}
              onClose={() => setShowSettings(false)}
              onTabChange={setActiveTab}
              onSubtitleSettingsChange={setSubtitleSettings}
              onVideoQualityChange={setVideoQuality}
            />
          </div>
        </div>
      </div>

      {/* فضای خالی داینامیک */}
      <div style={{ height: `${playerState.videoHeight}px` }}></div>

      {/* محتوای پایین */}
      <div className="px-4 pt-4 dark:bg-gray-900">
        {/* اطلاعات ویدیو */}
        <div className="mb-6">
          {/* بخش توضیحات */}
          <div className="mt-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
                  {fullTitle}
                </h1>
                
                {/* نشانگر سریال */}
                {seasonNumber && episodeNumber && (
                  <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-lg">
                    <span className="font-bold">فصل {seasonNumber}</span>
                    <span className="text-gray-500">|</span>
                    <span>قسمت {episodeNumber}</span>
                  </div>
                )}
              </div>

              {/* سطح ویدیو */}
              <div className="mb-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium">
                  سطح {videoData.level}
                </span>
              </div>

              {/* توضیحات متغیر */}
              {videoData.description ? (
                <div className="relative">
                  <p className={`text-sm text-gray-700 dark:text-gray-300 mb-2 ${!showFullDescription ? 'line-clamp-2' : ''}`}>
                    {videoData.description}
                  </p>
                  {videoData.description.length > 100 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      {showFullDescription ? 'بستن' : 'مشاهده بیشتر'}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  این ویدیوی آموزشی سطح {videoData.level} به شما کمک می‌کند تا مهارت‌های زبان خود را تقویت کنید. 
                  با مشاهده این ویدیو و تمرین لغات ارائه شده، می‌توانید درک شنیداری و دایره لغات خود را بهبود بخشید.
                </p>
              )}
            </div>
          </div>
        </div>

        <TabBar
          activeTab={activeTab}
          vocabularyCount={vocabularies.length}
          onTabChange={setActiveTab}
        />
        
        <div className="mt-4">
          {activeTab === 'subtitles' ? (
            <SubtitleList
              subtitles={subtitles}
              activeSubtitle={activeSubtitle}
              subtitleSettings={subtitleSettings}
              videoHeight={playerState.videoHeight}
              onSubtitleJump={handleSubtitleJump}
              onWordClick={handleWordClick}
            />
          ) : (
            <VocabularyList
              vocabularies={vocabularies}
              onRemoveWord={handleRemoveWord}
            />
          )}
        </div>
        
        {/* لینک بازگشت به سریال (اگر سریال است) */}
        {seriesTitle && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
            <Link 
              href={`/series/${videoData.id}`}
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              بازگشت به صفحه سریال {seriesTitle}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}