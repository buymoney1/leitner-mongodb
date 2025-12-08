'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Play, 
  Pause, 
  Clock, 
  Headphones, 
  ArrowLeft,
  BookOpen,
  Volume2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Bookmark,
  Share2
} from 'lucide-react';
import DictionaryModal from '@/components/DictionaryModal';
import { toast } from 'sonner';

interface Podcast {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  level: string;
  transcript?: string;
  isPublished: boolean;
  vocabularies: {
    id: string;
    word: string;
    meaning: string;
    timestamp?: number;
  }[];
  createdAt: string;
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

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    transcript: true,
    vocabulary: true
  });
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchPodcast();
    }
  }, [params.id]);

  useEffect(() => {
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setPlaying(false);

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audio]);

  const fetchPodcast = async () => {
    try {
      const response = await fetch(`/api/podcasts/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setPodcast(data);
        if (data.audioUrl) {
          const newAudio = new Audio(data.audioUrl);
          setAudio(newAudio);
        }
      } else {
        console.error('Error fetching podcast:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audio) return;

    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audio) return;
    
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const jumpToTimestamp = (timestamp?: number) => {
    if (!audio || !timestamp) return;
    
    audio.currentTime = timestamp;
    setCurrentTime(timestamp);
    
    if (!playing) {
      audio.play();
      setPlaying(true);
    }
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
    setIsDictionaryModalOpen(true);
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
        toast.success('کارت با موفقیت به فلش‌کارت‌ها اضافه شد.');
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن کارت.");
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور.');
      return Promise.reject(error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedWord(text);
      setTimeout(() => setCopiedWord(null), 2000);
      toast.success('متن کپی شد');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('خطا در کپی کردن');
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleShare = async () => {
    if (navigator.share && podcast) {
      try {
        await navigator.share({
          title: podcast.title,
          text: podcast.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('خطا در اشتراک‌گذاری');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('لینک پادکست کپی شد');
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'از نشان‌ها حذف شد' : 'به نشان‌ها اضافه شد');
  };

  // تابع برای رندر کلمات در متن
  const renderWordsInText = (text: string) => {
    const words = text.split(' ');
    
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,!?;:]$/g, '');
      
      if (podcast?.vocabularies) {
        const vocab = podcast.vocabularies.find(
          v => v.word.toLowerCase() === cleanWord.toLowerCase()
        );
        
        if (vocab) {
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleWordClick(vocab.word);
              }}
              className="cursor-pointer text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border-b-2 border-dashed border-green-500/50 mx-0.5 font-medium transition-colors duration-200"
              title={`${vocab.word}: ${vocab.meaning}`}
            >
              {word}{' '}
            </span>
          );
        }
      }
      
      if (cleanWord.length > 1 && /^[a-zA-Z]+$/.test(cleanWord)) {
        return (
          <span
            key={index}
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
      
      return <span key={index}>{word} </span>;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto p-8 text-center">
          <Headphones className="h-24 w-24 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">پادکست یافت نشد</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">پادکستی با این شناسه وجود ندارد.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25"
          >
            <ArrowLeft className="h-5 w-5" />
            بازگشت به لیست پادکست‌ها
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* مودال دیکشنری */}
      <DictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
        initialWord={selectedWord}
        onAddToFlashcards={handleAddToFlashcards}
      />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all duration-300"
          >
            بازگشت
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title="اشتراک‌گذاری"
            >
              <Share2 className="h-5 w-5" />
            </button>
            

            
            <span className="px-4 py-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-sm border border-purple-500/30">
              سطح {podcast.level}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Podcast Header */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-300 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cover Image */}
              {podcast.coverUrl && (
                <div className="md:w-1/4">
                  <img 
                    src={podcast.coverUrl} 
                    alt={podcast.title}
                    className="w-full aspect-square object-cover rounded-2xl shadow-2xl"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-left text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {podcast.title}
                </h1>

        

                {/* Audio Player */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="p-4 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg shadow-purple-500/25 transition-all duration-300"
                    >
                      {playing ? (
                        <Pause className="h-6 w-6 text-white" />
                      ) : (
                        <Play className="h-6 w-6 text-white fill-current" />
                      )}
                    </button>

                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatTime(duration)}</span>
                        <span>{formatTime(currentTime)}</span>
                      </div>
                      
                      <input
                        dir='ltr'
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {podcast.description && (
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700/50 overflow-hidden">
              <button
                onClick={() => toggleSection('description')}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors duration-300"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">توضیحات</h2>
                </div>
                {expandedSections.description ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {expandedSections.description && (
                <div className="px-6 pb-6">
                  <p className="text-left text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base md:text-lg">
                    {renderWordsInText(podcast.description)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transcript Section */}
          {podcast.transcript && (
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700/50 overflow-hidden">
              <button
                onClick={() => toggleSection('transcript')}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors duration-300"
              >
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">متن پادکست</h2>
                </div>
                {expandedSections.transcript ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {expandedSections.transcript && (
                <div className="px-6 pb-6">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div className="bg-gray-50 dark:bg-gray-800/70 rounded-xl p-6 border border-gray-300 dark:border-gray-700/50">
                      <p className="text-left text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-base md:text-lg">
                        {renderWordsInText(podcast.transcript)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vocabulary Section */}
          {podcast.vocabularies && podcast.vocabularies.length > 0 && (
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700/50 overflow-hidden">
              <button
                onClick={() => toggleSection('vocabulary')}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors duration-300"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    لغات ({podcast.vocabularies.length})
                  </h2>
                </div>
                {expandedSections.vocabulary ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {expandedSections.vocabulary && (
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {podcast.vocabularies.map((vocab) => (
                      <div 
                        key={vocab.id}
                        className="group bg-gray-50 dark:bg-gray-800/70 rounded-xl p-4 border border-gray-300 dark:border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          handleWordClick(vocab.word);
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                              {vocab.word}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                              {vocab.meaning}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                    
                            
                            {vocab.timestamp && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  jumpToTimestamp(vocab.timestamp);
                                }}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                              >
                                <Play className="h-3 w-3 fill-current" />
                                {formatTime(vocab.timestamp)}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {vocab.timestamp && (
                          <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-700/50">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              زمان: {formatTime(vocab.timestamp)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="mb-20 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>تاریخ ایجاد: {new Date(podcast.createdAt).toLocaleDateString('fa-IR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}