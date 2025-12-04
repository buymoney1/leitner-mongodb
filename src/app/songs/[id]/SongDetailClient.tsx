// app/songs/[id]/SongDetailClient.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Music, User, Clock, ArrowLeft, Play, Pause, Calendar, Disc } from 'lucide-react';
import AudioPlayer from '@/components/songs/AudioPlayer';
import { AudioPlayerHandle }  from '@/components/songs/AudioPlayer';


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

export default function SongDetailClient() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);

  useEffect(() => {
    fetchSong();
  }, [params.id]);

  const fetchSong = async () => {
    try {
      const response = await fetch(`/api/songs/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setSong(data.song);
      }
    } catch (error) {
      console.error('Error fetching song:', error);
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

  const handleBack = () => {
    router.push('/songs');
  };

  // Parse lyrics into lines
  const lyricsLines = song?.lyrics.split('\n') || [];

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

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700/50 shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-300">
            
            {/* Song Header */}
            <div className="p-6 md:p-8 border-b border-gray-300 dark:border-gray-700/50">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Cover Image */}
                {song.coverUrl ? (
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10 flex items-center justify-center shadow-lg">
                    <Music className="h-16 w-16 text-green-600 dark:text-green-400" />
                  </div>
                )}

                {/* Song Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                    {song.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium">{song.artist}</span>
                    </div>
                    
                    {song.album && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Disc className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span>{song.album}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span>{formatDuration(song.duration)}</span>
                    </div>
                  </div>

                  {/* Play/Pause Button */}
                  <button
                    onClick={handlePlayPause}
                    className={`flex items-center gap-3 px-6 py-3 text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg ${
                      isPlaying 
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
                        : 'bg-green-500 hover:bg-green-600 shadow-green-500/25'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-6 w-6" />
                        <span>توقف پخش</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-6 w-6" />
                        <span>پخش آهنگ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Lyrics Section */}
            <div className="p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Music className="h-6 w-6 text-green-600 dark:text-green-400" />
                  متن آهنگ و ترجمه
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  هر خط انگلیسی با ترجمه فارسی در خط بعدی
                </p>
              </div>

              {/* Lyrics Container */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 md:p-8 border border-gray-300 dark:border-gray-700/50">
                <div className="space-y-6">
                  {lyricsLines.map((line, index) => {
                    if (line.trim() === '') {
                      return <div key={index} className="h-4" />;
                    }
                    
                    return (
                      <div
                        key={index}
                        className="text-center"
                      >
                        <p className="text-lg font-medium leading-relaxed text-gray-900 dark:text-white">
                          {line}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="p-6 md:p-8 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-300 dark:border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-300 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">تاریخ افزودن</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(song.createdAt)}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-300 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">مدت زمان</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDuration(song.duration)}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-300 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">خواننده</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {song.artist}
                  </p>
                </div>
              </div>
              
              {/* Uploader Info */}
              {song.createdBy && (
                <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    {song.createdBy.image && (
                      <img
                        src={song.createdBy.image}
                        alt={song.createdBy.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">افزوده شده توسط</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {song.createdBy.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
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