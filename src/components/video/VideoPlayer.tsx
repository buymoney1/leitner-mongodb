"use client";

import ReactPlayer from "react-player/lazy";
import { useState, useRef, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { parseVTT } from "@/utils";
import { PlayerState, Subtitle, SubtitleSettings, VideoQuality, Vocabulary } from "../../../types";
import PlayerControls from "../PlayerControls";
import SettingsPanel from "../SettingsPanel";
import TabBar from "../TabBar";
import VideoSubtitles from "../VideoSubtitles";
import VocabularyList from "./VocabularyList";
import SubtitleList from "../SubtitleList";
import DictionaryModal from "../DictionaryModal";
import QuickWordDialog from "./QuickWordDialog";
import { ArrowLeft, Play, AlertCircle, Home, Film, Volume2, BookOpen, Clock, ChevronDown, ChevronUp, Globe, User, Calendar, Hash, Info, SkipBack, SkipForward } from 'lucide-react';
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
  videoId?: string;
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
  const [isMobileInfoExpanded, setIsMobileInfoExpanded] = useState(false);
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

  // State برای مدیریت لغات
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [quickWordDialog, setQuickWordDialog] = useState<{
    isOpen: boolean;
    word: string;
    meaning?: string;
  }>({
    isOpen: false,
    word: '',
    meaning: ''
  });

  // State برای مودال دیکشنری اصلی
  const [dictionaryModal, setDictionaryModal] = useState<{
    isOpen: boolean;
    word: string;
    meaning: string;
  }>({
    isOpen: false,
    word: '',
    meaning: ''
  });

  // --- Refs ---
  const playerRef = useRef<ReactPlayer | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileInfoRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  useEffect(() => {
    if (initialVideoData) {
      processVideoData(initialVideoData);
      setLoading(false);
      return;
    }

    const fetchVideoData = async () => {
      try {
        setLoading(true);

        if (!videoId) {
          throw new Error('شناسه ویدیو نامعتبر است');
        }

        const response = await fetch(`/api/videos/${videoId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('ویدیو یافت نشد');
          }
          throw new Error(`خطا در دریافت ویدیو: ${response.status}`);
        }

        const data = await response.json();

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

  const processVideoData = (data: any) => {
    setVideoData(data);

    if (data.subtitlesVtt) {
      try {
        const parsedSubtitles = parseVTT(data.subtitlesVtt);
        setSubtitles(parsedSubtitles);
      } catch (parseError) {
        console.error('Error parsing subtitles:', parseError);
        setSubtitles([]);
      }
    } else {
      setSubtitles([]);
    }

    if (data.vocabularies && data.vocabularies.length > 0) {
      const formattedVocabularies: Vocabulary[] = data.vocabularies.map((vocab: any) => ({
        id: vocab.id,
        word: vocab.word,
        meaning: vocab.meaning,
        videoId: data.id
      }));
      setVocabularies(formattedVocabularies);
    } else {
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

  // اسکرول به آکاردئون هنگام باز شدن
  useEffect(() => {
    if (isMobileInfoExpanded && mobileInfoRef.current) {
      setTimeout(() => {
        mobileInfoRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    }
  }, [isMobileInfoExpanded]);

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
      if (playerState.playing && !showSettings && !quickWordDialog.isOpen && !dictionaryModal.isOpen) {
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

  // تابع جدید برای رد کردن 10 ثانیه به عقب
  const handleSkipBackward = () => {
    if (playerRef.current) {
      const newTime = Math.max(0, playerState.currentTime - 10);
      playerRef.current.seekTo(newTime, 'seconds');
      setPlayerState(prev => ({ ...prev, currentTime: newTime }));
    }
  };

  // تابع جدید برای رد کردن 10 ثانیه به جلو
  const handleSkipForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(playerState.duration, playerState.currentTime + 10);
      playerRef.current.seekTo(newTime, 'seconds');
      setPlayerState(prev => ({ ...prev, currentTime: newTime }));
    }
  };

  const handleWordClick = (word: string) => {
    console.log('Word clicked:', word);

    // Pause video and show controls when dialog opens
    setPlayerState(prev => ({
      ...prev,
      playing: false,
      showControls: true
    }));

    // Find existing meaning
    const existingWord = vocabularies.find(v => v.word.toLowerCase() === word.toLowerCase());

    setQuickWordDialog({
      isOpen: true,
      word: word,
      meaning: existingWord?.meaning || ''
    });
  };

  const handleAddToLeitner = async (word: string, meaning: string) => {
    try {
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

      console.log("Word saved to Leitner system:", { word, meaning });

      // بستن دیالوگ
      setQuickWordDialog({ isOpen: false, word: '', meaning: '' });

    } catch (error) {
      console.error("Error saving word to Leitner:", error);
      throw error;
    }
  };

  const handleViewDetails = () => {
    setDictionaryModal({
      isOpen: true,
      word: quickWordDialog.word,
      meaning: quickWordDialog.meaning || ''
    });
    setQuickWordDialog({ isOpen: false, word: '', meaning: '' });
  };

  const handleAddToFlashcards = async (word: string, meaning: string) => {
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front: word.trim(),
          back: meaning.trim()
        }),
      });

      if (response.ok) {
        console.log("Word added to flashcards:", word);
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن لغت.");
      }
    } catch (error) {
      console.error("Error adding to flashcards:", error);
      throw error;
    }
  };

  const handleRemoveWord = async (id: string) => {
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("خطا در حذف کارت");
      }

      setVocabularies(prev => prev.filter(v => v.id !== id));
      console.log("Word removed successfully:", id);

    } catch (error) {
      console.error("Error removing word from API:", error);
      setVocabularies(prev => prev.filter(v => v.id !== id));
    }
  };

  const updatePlayerState = (updates: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  };

  const getFullTitle = () => {
    if (!videoData) return '';

    let title = videoData.title;

    if (seasonNumber && episodeNumber) {
      title = `فصل ${seasonNumber}، قسمت ${episodeNumber}: ${title}`;
    }

    if (seriesTitle) {
      title = `${seriesTitle} - ${title}`;
    }

    return title;
  };

  // --- Render Helpers ---
  const renderLoading = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="z-10 text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent animate-spin"></div>
          <Film className="absolute inset-0 m-auto w-10 h-10 text-gray-400 dark:text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">در حال آماده‌سازی پخش‌کننده...</h2>
        <p className="text-gray-500 dark:text-gray-400">لطفاً چند لحظه صبر کنید</p>
      </div>
    </div>
  );

  const renderError = (errorMessage: string) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-100/50 dark:from-red-900/10 to-gray-50 dark:to-gray-950"></div>
      <div className="z-10 max-w-md w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">متاسفانه مشکلی پیش آمد</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {errorMessage || 'ویدیو مورد نظر یافت نشد یا در دسترس نیست.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-medium transition-all border border-gray-300 dark:border-gray-700 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            بازگشت
          </button>
          <Link
            href="/video-levels"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-lg shadow-blue-600/20 dark:shadow-blue-600/10 flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );

  // نمایش loading
  if (loading) return renderLoading();

  // نمایش خطا
  if (error || !videoData) return renderError(error || 'ویدیو یافت نشد');

  if (!videoData.videoUrl) return renderError('لینک ویدیو نامعتبر است');

  const fullTitle = getFullTitle();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-100 dark:bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-100 dark:bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Quick Word Dialog */}
      <QuickWordDialog
        isOpen={quickWordDialog.isOpen}
        word={quickWordDialog.word}
        meaning={quickWordDialog.meaning}
        onClose={() => setQuickWordDialog({ isOpen: false, word: '', meaning: '' })}
        onAddToLeitner={handleAddToLeitner}
        onViewDetails={handleViewDetails}
      />

      {/* Main Dictionary Modal */}
      <DictionaryModal
        isOpen={dictionaryModal.isOpen}
        onClose={() => setDictionaryModal({ isOpen: false, word: '', meaning: '' })}
        initialWord={dictionaryModal.word}
        initialMeaning={dictionaryModal.meaning}
        onAddToFlashcards={handleAddToFlashcards}
      />

      {/* Container */}
      <div className="w-full max-w-[1600px] mx-auto p-4 lg:p-6 lg:pt-8" dir="rtl">
        
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT SIDE (on RTL layout, this is visually right): Video Player */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Video Container */}
            <div 
              ref={playerContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                if (playerState.playing && !showSettings && !quickWordDialog.isOpen && !dictionaryModal.isOpen) {
                  updatePlayerState({ showControls: false });
                }
              }}
              className="relative group bg-black rounded-xl lg:rounded-2xl overflow-hidden shadow-lg lg:shadow-2xl shadow-gray-300/50 dark:shadow-black/50 border border-gray-200 dark:border-gray-800"
              style={{ aspectRatio: '16/9', pointerEvents: 'auto' }}
              onClick={(e) => {
                if (!(e.currentTarget as HTMLElement).closest('[class*="hover:bg-blue-500"]') && 
                    !quickWordDialog.isOpen && 
                    !dictionaryModal.isOpen && 
                    !showSettings) {
                  updatePlayerState({ playing: !playerState.playing });
                }
              }}
            >
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
                config={{ 
                  file: { 
                    attributes: { 
                      controlsList: 'nodownload',
                      disablePictureInPicture: true
                    } 
                  } 
                }}
                style={{ background: '#000' }}
              />

              {/* Subtitles Overlay */}
              <VideoSubtitles
                activeSubtitle={activeSubtitle}
                subtitleSettings={subtitleSettings}
                showControls={playerState.showControls}
                onWordClick={handleWordClick}
              />

              {/* Skip Buttons Overlay */}
              <div className={`absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${playerState.showControls ? 'opacity-100' : 'opacity-0'}`}>


              </div>

              {/* Controls Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${playerState.showControls ? 'opacity-100' : 'opacity-0'}`}>
                <PlayerControls
                  playing={playerState.playing}
                  currentTime={playerState.currentTime}
                  duration={playerState.duration}
                  isFullScreen={playerState.isFullScreen}
                  showControls={playerState.showControls}
                  onPlayPause={() => updatePlayerState({ playing: !playerState.playing })}
                  onSeek={(time) => {
                    updatePlayerState({ currentTime: time });
                    if (playerRef.current) playerRef.current.seekTo(time, 'seconds');
                  }}
                  onFullScreen={toggleFullScreen}
                  onShowSettings={() => setShowSettings(true)}
                  onSkipBackward={handleSkipBackward}
                  onSkipForward={handleSkipForward}
                />
              </div>

              {/* Settings Panel */}
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

            {/* Mobile Accordion - Video Info Section */}
            <div ref={mobileInfoRef} className="lg:hidden">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300">
                {/* Accordion Header - Minimal Mobile View */}
                <button
                  onClick={() => setIsMobileInfoExpanded(!isMobileInfoExpanded)}
                  className="w-full p-4 flex items-center justify-between text-right hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  aria-expanded={isMobileInfoExpanded}
                >
                  <div className="flex flex-col items-end gap-1.5 flex-1 min-w-0">
                    {/* Level Badge */}
      
      
                    
                    {/* Title - Truncated */}
                    <h2 className="text-sm font-bold text-gray-800 dark:text-white truncate text-right w-full">
                      {fullTitle}
                    </h2>
    
    
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0 mr-3">
                    {isMobileInfoExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Accordion Content - Expanded Details */}
                {isMobileInfoExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-800/50 animate-in slide-in-from-top duration-300">
                    {/* Detailed Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 my-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-gray-600 dark:text-gray-400 text-xs mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          کل زیرنویس‌ها
                        </div>
                        <div className="text-lg font-bold text-gray-800 dark:text-white">{subtitles.length}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                        <div className="text-gray-600 dark:text-gray-400 text-xs mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          لغات ذخیره شده
                        </div>
                        <div className="text-lg font-bold text-gray-800 dark:text-white">{vocabularies.length}</div>
                      </div>
                    </div>

                    {/* Description Section */}
                    {videoData.description && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-800/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold">توضیحات</span>
                          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-800/50"></div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {videoData.description}
                        </p>
                        {videoData.description.length > 300 && (
                          <button
                            onClick={() => setShowFullDescription(!showFullDescription)}
                            className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            {showFullDescription ? 'نمایش کمتر' : 'ادامه توضیحات'}
                            <ArrowLeft className={`w-3 h-3 transition-transform ${showFullDescription ? 'rotate-0' : 'rotate-180'}`} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Video Info Section */}
            <div className="hidden lg:block bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:p-8 shadow-lg dark:shadow-xl">
              <div className="flex flex-col gap-6">
                
                {/* Title Header */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {videoData.level}
                    </span>
                    {seasonNumber && episodeNumber && (
                      <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Film className="w-3 h-3" />
                        S{seasonNumber} E{episodeNumber}
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-800 dark:text-white leading-tight">
                    {fullTitle}
                  </h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-600 dark:text-gray-400 text-xs mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      زیرنویس‌ها
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{subtitles.length}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-600 dark:text-gray-400 text-xs mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      لغات
                    </div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{vocabularies.length}</div>
                  </div>
                </div>

                {/* Description */}
                {videoData.description && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="relative">
                      <p className={`text-gray-700 dark:text-gray-300 leading-7 text-sm lg:text-base ${
                        !showFullDescription ? 'line-clamp-3' : ''
                      }`}>
                        {videoData.description}
                      </p>
                      {videoData.description.length > 150 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          {showFullDescription ? 'نمایش کمتر' : 'ادامه مطلب'}
                          <ArrowLeft className={`w-4 h-4 transition-transform ${showFullDescription ? 'rotate-0' : 'rotate-180'}`} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (Visually Left in RTL): Interactive Sidebar */}
          <div className="lg:col-span-4 flex flex-col h-full max-h-[calc(100vh-40px)] lg:max-h-[calc(100vh-100px)] sticky top-6">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg dark:shadow-2xl overflow-hidden flex flex-col h-full">
              
              {/* Glassmorphism Header Tabs */}
              <TabBar
                activeTab={activeTab}
                vocabularyCount={vocabularies.length}
                onTabChange={setActiveTab}
              />
              
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-hidden relative">
                <div className="h-full overflow-y-auto custom-scrollbar p-4">
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
                      onWordClick={(vocab) => {
                        setQuickWordDialog({
                          isOpen: true,
                          word: vocab.word,
                          meaning: vocab.meaning
                        });
                      }}
                    />
                  )}
                </div>
              </div>
              
              {/* Bottom Gradient for fade effect */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        
        /* Dark mode scrollbar */
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(31, 41, 55, 0.5);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(75, 85, 99, 0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(75, 85, 99, 0.5);
          }
        }
        
        /* Line Clamp Utilities */
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Animation classes */
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}