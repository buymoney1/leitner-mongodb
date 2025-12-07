"use client";
import ReactPlayer from "react-player/lazy";
import { useState, useRef, useEffect } from "react";
import { parseVTT } from "@/utils";
import { PlayerState, Subtitle, SubtitleSettings, VideoQuality, Vocabulary } from "../../../types";
import PlayerControls from "../PlayerControls";
import SaveWordPopup from "../SaveWordPopup";
import SettingsPanel from "../SettingsPanel";
import SubtitleList from "../SubtitleList";
import TabBar from "../TabBar";
import VideoSubtitles from "../VideoSubtitles";
import VocabularyList from "./VocabularyList";


export default function VideoPlayer() {
  // --- State ---
  const [playerState, setPlayerState] = useState<PlayerState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    isFullScreen: false,
    showControls: true,
    videoHeight: 0
  });

  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<Subtitle | null>(null);
  
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
    fetch("/subs/text.vtt")
      .then(r => r.text())
      .then(content => setSubtitles(parseVTT(content)))
      .catch(e => console.error("Error loading subs:", e));

    // بارگذاری لغات ذخیره شده از localStorage (موقت)
    const savedVocabularies = localStorage.getItem('videoPlayerVocabularies');
    if (savedVocabularies) {
      setVocabularies(JSON.parse(savedVocabularies));
    }
  }, []);

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

  // ذخیره لغات در localStorage هنگام تغییر
  useEffect(() => {
    localStorage.setItem('videoPlayerVocabularies', JSON.stringify(vocabularies));
  }, [vocabularies]);

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
    playerRef.current?.seekTo(time, 'seconds');
    setPlayerState(prev => ({ ...prev, playing: true }));
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
              url="/test-video.mp4"
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
                playerRef.current?.seekTo(time, 'seconds');
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
              onWordClick={handleWordClick}
              onRemoveWord={handleRemoveWord}
            />
          )}
        </div>
      </div>
    </div>
  );
}