// app/songs/[id]/SongDetailClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Music, User, Clock, ArrowLeft, Play, Pause, Calendar, Disc } from 'lucide-react';
import AudioPlayer from '@/components/songs/AudioPlayer';
import { AudioPlayerHandle } from '@/components/songs/AudioPlayer';
import DictionaryModal from '@/components/DictionaryModal';
import { toast } from 'sonner';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  lyrics: string;
  createdAt: string;
  createdBy?: {
    name: string;
    image?: string;
  };
}

// کامپوننت برای نمایش متن قابل کلیک
const ClickableText = ({ text, onWordClick }: { text: string; onWordClick: (word: string) => void }) => {
  const extractWords = (text: string): string[] => {
    const words = text.split(/\s+/);
    const englishWords: string[] = [];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-zA-Z]$/g, '').replace(/^[^a-zA-Z]/g, '');
      
      if (cleanWord.length > 1 && /^[a-zA-Z]+$/.test(cleanWord)) {
        englishWords.push(cleanWord);
      }
    });
    
    return englishWords;
  };

  const words = extractWords(text);
  
  if (words.length === 0) {
    return <span>{text}</span>;
  }

  let lastIndex = 0;
  const elements: JSX.Element[] = [];

  words.forEach((word, index) => {
    const wordStart = text.indexOf(word, lastIndex);
    
    if (wordStart > lastIndex) {
      elements.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, wordStart)}
        </span>
      );
    }
    
    elements.push(
      <span
        key={`word-${index}`}
        onClick={(e) => {
          e.stopPropagation();
          onWordClick(word);
        }}
        className="cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-500/20 px-1 rounded transition-all duration-200 border-b border-dashed border-cyan-500/50"
        title="کلیک برای افزودن به فلش‌کارت"
      >
        {word}
      </span>
    );
    
    lastIndex = wordStart + word.length;
  });

  if (lastIndex < text.length) {
    elements.push(
      <span key="text-final">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <>{elements}</>;
};

export default function SongDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);
  
  // State برای مدیریت مودال دیکشنری
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");

  useEffect(() => {
    fetchSong();
  }, [params.id]);

  const fetchSong = async () => {
    try {
      const response = await fetch(`/api/songs/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSong(data.song);
      } else {
        toast.error('خطا در دریافت اطلاعات آهنگ');
      }
    } catch (error) {
      console.error('Error fetching song:', error);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // وقتی وضعیت پخش در AudioPlayer تغییر کرد
  const handlePlayStateChange = (playing: boolean) => {
    setIsPlaying(playing);
  };

  // تابع اصلی برای کنترل پخش/توقف
  const handlePlayPause = async () => {
    if (!song) return;

    if (!isPlaying) {
      // اگر در حال پخش نیست
      if (!showPlayer) {
        // اگر پخش‌کننده نشان داده نمی‌شود، آن را نشان بده
        setShowPlayer(true);
        // کمی صبر کن تا کامپوننت mount شود
        setTimeout(() => {
          if (audioPlayerRef.current) {
            audioPlayerRef.current.play();
          }
        }, 100);
      } else {
        // اگر پخش‌کننده نشان داده می‌شود اما پخش نیست
        if (audioPlayerRef.current) {
          await audioPlayerRef.current.play();
        }
      }
    } else {
      // اگر در حال پخش هست
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    }
  };

  // توقف پخش وقتی پخش‌کننده بسته می‌شود
  const handleClosePlayer = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setShowPlayer(false);
    setIsPlaying(false);
  };

  // تابع برای کلیک روی کلمات متن آهنگ
  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setIsDictionaryModalOpen(true);
  };

  // تابع برای افزودن کارت به فلش‌کارت
  const handleAddToFlashcards = async (word: string, meaning: string) => {
    const loadingToast = toast.loading('در حال افزودن به فلش‌کارت...');
    
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
        toast.success(`کلمه "${word}" با موفقیت به فلش‌کارت‌ها اضافه شد!`, {
          id: loadingToast,
          duration: 3000,
        });
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن کارت.");
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور', {
        id: loadingToast,
        duration: 3000,
      });
      return Promise.reject(error);
    }
  };

  const handleBack = () => {
    router.push('/songs');
  };

  // Parse lyrics into lines
  const lyricsLines = song?.lyrics.split('\n') || [];

  // تابع برای رندر کلمات در هر خط از متن آهنگ
  const renderWordsInLyricLine = (line: string, lineIndex: number) => {
    const words = line.split(' ');
    
    return words.map((word, wordIndex) => {
      const cleanWord = word.replace(/[.,!?;:]$/g, '');
      
      if (cleanWord.length > 1 && /^[a-zA-Z]+$/.test(cleanWord)) {
        return (
          <span
            key={`${lineIndex}-${wordIndex}`}
            onClick={(e) => {
              e.stopPropagation();
              handleWordClick(cleanWord);
            }}
            className="cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-500/20 px-1 rounded transition-all duration-200 border-b border-dashed border-cyan-500/50"
            title="کلیک برای افزودن به فلش‌کارت"
          >
            {word}{' '}
          </span>
        );
      }
      
      return <span key={`${lineIndex}-${wordIndex}`}>{word} </span>;
    });
  };

  const handleShare = async () => {
    if (navigator.share && song) {
      try {
        await navigator.share({
          title: song.title,
          text: `متن آهنگ ${song.title} از ${song.artist}`,
          url: window.location.href,
        });
        toast.success('آهنگ با موفقیت به اشتراک گذاشته شد');
      } catch (err) {
        console.log('خطا در اشتراک‌گذاری');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('لینک آهنگ در کلیپ‌بورد کپی شد');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white p-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800/50 rounded-2xl mb-8"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 dark:bg-gray-800/30 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <Music className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl text-gray-600 dark:text-gray-400 mb-2">آهنگ یافت نشد</h1>
          <button
            onClick={() => router.push('/songs')}
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            بازگشت به لیست آهنگ‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* مودال دیکشنری */}
      <DictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
        initialWord={selectedWord}
        onAddToFlashcards={handleAddToFlashcards}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-300">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>بازگشت به لیست آهنگ‌ها</span>
            </button>
          </div>

          {/* Main Card - Compact Design */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl dark:shadow-2xl/30 overflow-hidden transition-all duration-300">
            
            {/* Compact Horizontal Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
              <div className="flex flex-row items-center gap-4 md:gap-6">
                {/* Cover Image - Fixed Size */}
                {song.coverUrl ? (
                  <div className="flex-shrink-0">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-20 h-20 md:w-28 md:h-28 rounded-xl object-cover shadow-lg ring-2 ring-gray-200 dark:ring-gray-800"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10 flex items-center justify-center shadow-lg ring-2 ring-gray-200 dark:ring-gray-800">
                    <Music className="h-10 w-10 md:h-12 md:w-12 text-green-600 dark:text-green-400" />
                  </div>
                )}

                {/* Song Info - Compact Layout */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                    <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {song.title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(song.duration)}</span>
                    </div>
                  </div>

                  {/* Artist and Album Info - Single Line */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-sm md:text-base">{song.artist}</span>
                    </div>
                    
                    {song.album && (
                      <>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Disc className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm md:text-base truncate">{song.album}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handlePlayPause}
                      className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md ${
                        isPlaying 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/25'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="h-4 w-4 md:h-5 md:w-5" />
                          <span className="text-sm font-medium">توقف</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 md:h-5 md:w-5" />
                          <span className="text-sm font-medium">پخش</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/25"
                    >
                      <span className="text-sm font-medium">اشتراک‌گذاری</span>
                    </button>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {formatDate(song.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lyrics Section - Compact */}
            <div className="p-4 md:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <Music className="h-5 w-5 text-green-600 dark:text-green-400" />
                  متن آهنگ + ترجمه
                </h2>
                <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">
                  برای ذخیره کردن کلمات در لایتنر شخصی، روی کلمات داخل متن آهنگ کلیک کنید.
                </p>
              </div>

              {/* Compact Lyrics Container */}
              <div className="">
                <div className="space-y-4 md:space-y-5">
                  {lyricsLines.map((line, index) => {
                    if (line.trim() === '') {
                      return <div key={index} className="h-2" />;
                    }
                    
                    return (
                      <div
                        key={index}
                        className="text-center leading-relaxed"
                      >
                        <p className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-1">
                          {renderWordsInLyricLine(line, index)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Stats - Grid Layout */}
            <div className="mb-40 p-4 md:p-6 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-gray-900/50 dark:to-transparent border-t border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">تاریخ</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate w-full">
                      {new Date(song.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">مدت</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDuration(song.duration)}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400 mb-1" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">خواننده</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate w-full">
                      {song.artist}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      {showPlayer && (
        <AudioPlayer
          ref={audioPlayerRef}
          audioUrl={song.audioUrl}
          songTitle={song.title}
          artist={song.artist}
          coverUrl={song.coverUrl}
          onClose={handleClosePlayer}
          onPlayStateChange={handlePlayStateChange}
        />
      )}
    </>
  );
}