// app/songs/components/AudioPlayer.tsx
'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, X, Music, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string;
  songTitle: string;
  artist: string;
  coverUrl?: string;
  onClose?: () => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export interface AudioPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => Promise<void>;
  isPlaying: boolean;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
}

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(({ 
  audioUrl, 
  songTitle, 
  artist, 
  coverUrl,
  onClose,
  onPlayStateChange
}, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // تابع formatDuration
  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    
    const secs = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play: async () => {
      if (audioRef.current && !isLoading && !hasError) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          return Promise.resolve();
        } catch (error) {
          console.error('Play error:', error);
          return Promise.reject(error);
        }
      }
      return Promise.reject(new Error('Audio not ready'));
    },
    pause: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    },
    togglePlayPause: async () => {
      if (!audioRef.current || isLoading || hasError) {
        return Promise.reject(new Error('Audio not ready'));
      }

      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          if (audioRef.current.readyState < 2) {
            setIsLoading(true);
            await new Promise<void>((resolve) => {
              const checkReadyState = () => {
                if (audioRef.current && audioRef.current.readyState >= 2) {
                  resolve();
                } else {
                  setTimeout(checkReadyState, 100);
                }
              };
              checkReadyState();
            });
            setIsLoading(false);
          }
          
          await audioRef.current.play();
          setIsPlaying(true);
        }
        return Promise.resolve();
      } catch (error) {
        console.error('Play/Pause error:', error);
        setIsPlaying(false);
        setHasError(true);
        return Promise.reject(error);
      }
    },
    isPlaying,
    seekTo: (time: number) => {
      if (audioRef.current && !isLoading) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    setVolume: (vol: number) => {
      const newVolume = Math.max(0, Math.min(1, vol));
      setVolume(newVolume);
      if (audioRef.current) {
        audioRef.current.volume = newVolume;
      }
    }
  }));

  // اطلاع دادن تغییر وضعیت پخش به parent
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    // Event handlers
    const handleLoadedData = () => {
      console.log('Audio loaded');
      setIsLoading(false);
      const dur = Math.floor(audio.duration);
      setDuration(isNaN(dur) ? 0 : dur);
    };

    const handleTimeUpdate = () => {
      const time = Math.floor(audio.currentTime);
      setCurrentTime(isNaN(time) ? 0 : time);
    };

    const handleEnded = () => {
      console.log('Audio ended');
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio error event:', e);
      const audioEl = e.target as HTMLAudioElement;
      console.error('Audio error details:', audioEl.error);
      
      setIsLoading(false);
      setHasError(true);
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('Audio can play');
      setIsLoading(false);
    };

    const handleCanPlayThrough = () => {
      console.log('Audio can play through');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log('Audio loading started');
      setIsLoading(true);
    };

    const handlePlay = () => {
      console.log('Audio play event');
      setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('Audio pause event');
      setIsPlaying(false);
    };

    const handleStalled = () => {
      console.log('Audio stalled');
      setIsLoading(true);
    };

    const handleWaiting = () => {
      console.log('Audio waiting');
      setIsLoading(true);
    };

    // Set up event listeners
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('waiting', handleWaiting);

    // Set audio source and load
    try {
      console.log('Setting audio source:', audioUrl);
      audio.src = audioUrl;
      audio.preload = 'auto';
      audio.volume = volume;
      audio.load();
    } catch (error) {
      console.error('Error setting audio source:', error);
      setHasError(true);
      setIsLoading(false);
    }

    setIsMounted(true);

    // Cleanup
    return () => {
      console.log('Cleaning up audio player');
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('waiting', handleWaiting);
      
      if (audio) {
        audio.pause();
        audio.src = '';
        audio.load();
      }
    };
  }, [audioUrl]);

  // Auto play when component mounts and audio is ready
  useEffect(() => {
    if (isMounted && !isLoading && !hasError && audioRef.current) {
      const playAudio = async () => {
        try {
          console.log('Attempting auto-play');
          await audioRef.current?.play();
          console.log('Auto-play successful');
        } catch (error) {
          console.error('Auto-play failed:', error);
        }
      };
      
      // Delay auto-play slightly to ensure everything is ready
      const timeoutId = setTimeout(playAudio, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isMounted, isLoading, hasError]);

  const togglePlayPause = async () => {
    if (!audioRef.current || isLoading || hasError) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Wait for audio to be ready
        if (audioRef.current.readyState < 2) {
          setIsLoading(true);
          await new Promise<void>((resolve) => {
            const checkReadyState = () => {
              if (audioRef.current && audioRef.current.readyState >= 2) {
                resolve();
              } else {
                setTimeout(checkReadyState, 100);
              }
            };
            checkReadyState();
          });
          setIsLoading(false);
        }
        
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Play/Pause error:', error);
      setIsPlaying(false);
      setHasError(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (audioRef.current && !isLoading) {
      audioRef.current.currentTime = value;
      setCurrentTime(Math.floor(value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newVolume = Math.max(0, Math.min(1, value));
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handlePrevious = () => {
    if (audioRef.current && !isLoading) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    if (audioRef.current && !isLoading && duration > 0) {
      const newTime = Math.max(0, duration - 5);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const retryLoad = () => {
    if (audioRef.current) {
      console.log('Retrying audio load...');
      setHasError(false);
      setIsLoading(true);
      setIsPlaying(false);
      
      try {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      } catch (error) {
        console.error('Error retrying load:', error);
        setHasError(true);
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Player Bar - Mobile */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-gradient-to-r from-white to-gray-100 dark:from-gray-900 dark:to-black border-t border-gray-300 dark:border-gray-800 p-2 z-[60] transition-colors duration-300 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          
          {/* Song Info - Mobile */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={songTitle}
                className="w-10 h-10 rounded-lg object-cover shadow flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.cover-fallback');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }
                }}
              />
            ) : null}
            <div className={`${!coverUrl ? 'flex items-center justify-center w-10 h-10' : ''} cover-fallback rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10 shadow flex-shrink-0 ${coverUrl ? 'hidden' : 'flex'}`}>
              <Music className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {songTitle}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {artist}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </div>
            </div>
          </div>

          {/* Controls - Mobile */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlayPause}
              disabled={isLoading || hasError}
              className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title={isPlaying ? 'توقف' : 'پخش'}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasError ? (
                <Music className="h-4 w-4" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center"
                title="بستن پخش‌کننده"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar - Mobile */}
        <div className="mt-2">
          <input
            type="range"
            min="0"
            dir='ltr'
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={isLoading || hasError || duration <= 0}
            className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
          />
        </div>

        {/* Error Message - Mobile */}
        {(isLoading || hasError) && (
          <div className="mt-1 flex items-center justify-between">
            {isLoading && (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-green-600 dark:text-green-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  در حال بارگذاری...
                </span>
              </div>
            )}
            {hasError && (
              <button 
                onClick={retryLoad}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                خطا در بارگذاری، تلاش مجدد
              </button>
            )}
          </div>
        )}

     
      </div>

      {/* Player Bar - Desktop */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white to-gray-100 dark:from-gray-900 dark:to-black border-t border-gray-300 dark:border-gray-800 p-4 z-40 transition-colors duration-300 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Song Info - Desktop */}
          <div className="flex items-center gap-4">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={songTitle}
                className="w-16 h-16 rounded-lg object-cover shadow"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('.cover-fallback-desktop');
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }
                }}
              />
            ) : null}
            <div className={`${!coverUrl ? 'flex items-center justify-center w-16 h-16' : ''} cover-fallback-desktop rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10 shadow ${coverUrl ? 'hidden' : 'flex'}`}>
              <Music className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{songTitle}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{artist}</p>
              {isLoading && (
                <div className="flex items-center gap-1 mt-1">
                  <Loader2 className="h-3 w-3 animate-spin text-green-600 dark:text-green-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">در حال بارگذاری...</span>
                </div>
              )}
              {hasError && (
                <button 
                  onClick={retryLoad}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 mt-1"
                >
                  خطا در بارگذاری، تلاش مجدد
                </button>
              )}
            </div>
          </div>

          {/* Controls - Desktop */}
          <div className="flex items-center gap-6">
            {/* Time Display */}
            <div className="text-sm text-gray-600 dark:text-gray-400 min-w-[120px] text-center font-mono">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>

            {/* Control Buttons */}
            <button 
              onClick={handlePrevious}
              disabled={isLoading || hasError}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="برگشت به ابتدا"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            
            <button
              onClick={togglePlayPause}
              disabled={isLoading || hasError}
              className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title={isPlaying ? 'توقف' : 'پخش'}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : hasError ? (
                <Music className="h-6 w-6" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>
            
            <button 
              onClick={handleNext}
              disabled={isLoading || hasError || duration <= 0}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="پرش ۵ ثانیه"
            >
              <SkipForward className="h-5 w-5" />
            </button>

            {/* Progress Bar */}
            <div className="w-64">
              <input
                type="range"
                min="0"
                dir='ltr'
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                disabled={isLoading || hasError || duration <= 0}
                className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
              />
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <input
                type="range"
                dir='ltr'
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                disabled={isLoading || hasError}
                className="w-24 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
              />
            </div>
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="بستن پخش‌کننده"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;