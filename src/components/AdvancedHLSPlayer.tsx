// components/AdvancedVideoPlayer.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';

interface AdvancedVideoPlayerProps {
  url: string;
  vttTrackUrl?: string;
  title?: string;
  autoPlay?: boolean;
  poster?: string;
  onReady?: () => void;
  onError?: (error: any) => void;
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onEnded?: () => void;
}

interface PlayerState {
  playing: boolean;
  muted: boolean;
  volume: number;
  played: number;
  loaded: number;
  duration: number;
  seeking: boolean;
  playbackRate: number;
  fullscreen: boolean;
}

const AdvancedVideoPlayer: React.FC<AdvancedVideoPlayerProps> = ({
  url,
  vttTrackUrl,
  title,
  autoPlay = false,
  poster,
  onReady,
  onError,
  onProgress,
  onEnded
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [playerState, setPlayerState] = useState<PlayerState>({
    playing: autoPlay,
    muted: false,
    volume: 0.8,
    played: 0,
    loaded: 0,
    duration: 0,
    seeking: false,
    playbackRate: 1.0,
    fullscreen: false,
  });

  const [isReady, setIsReady] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // هندلرهای پایه
  const handleReady = useCallback((): void => {
    setIsReady(true);
    onReady?.();
  }, [onReady]);

  const handlePlay = useCallback((): void => {
    setPlayerState(prev => ({ ...prev, playing: true }));
  }, []);

  const handlePause = useCallback((): void => {
    setPlayerState(prev => ({ ...prev, playing: false }));
  }, []);

  const handleProgress = useCallback((state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }): void => {
    if (!playerState.seeking) {
      setPlayerState(prev => ({ 
        ...prev, 
        played: state.played,
        loaded: state.loaded 
      }));
    }
    onProgress?.(state);
  }, [playerState.seeking, onProgress]);

  // اصلاح شده: استفاده از onDuration به جای onDuration
  const handleDuration = useCallback((duration: number): void => {
    setPlayerState(prev => ({ ...prev, duration }));
  }, []);

  const handleError = useCallback((error: any): void => {
    console.error('خطا در پخش ویدیو:', error);
    onError?.(error);
  }, [onError]);

  // کنترل‌های پخش
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = parseFloat(e.target.value);
    setPlayerState(prev => ({ 
      ...prev, 
      played: newValue,
      seeking: true 
    }));
  };

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>): void => {
    const newValue = parseFloat((e.target as HTMLInputElement).value);
    setPlayerState(prev => ({ ...prev, seeking: false }));
    playerRef.current?.seekTo(newValue);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value);
    setPlayerState(prev => ({ 
      ...prev, 
      volume: newVolume,
      muted: newVolume === 0 
    }));
  };

  const toggleMute = (): void => {
    setPlayerState(prev => ({ ...prev, muted: !prev.muted }));
  };

  const toggleFullscreen = useCallback((): void => {
    const element = containerRef.current;
    if (!element) return;

    if (!playerState.fullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
    setPlayerState(prev => ({ ...prev, fullscreen: !prev.fullscreen }));
  }, [playerState.fullscreen]);

  // مدیریت نمایش کنترل‌ها
  const showControlsTemporarily = useCallback((): void => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  }, [controlsTimeout]);

  // فرمت زمان
  const formatTime = useCallback((seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  }, []);

  // اثر برای مدیریت کنترل‌ها
  useEffect(() => {
    if (showControls) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [showControls]);

  // پاک‌سازی تایم‌اوت
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // هندلر تغییر حالت تمام صفحه
  useEffect(() => {
    const handleFullscreenChange = () => {
      setPlayerState(prev => ({
        ...prev,
        fullscreen: !!document.fullscreenElement
      }));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="w-full flex items-center justify-center p-4 bg-white dark:bg-black">
      <div 
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black border border-gray-300 dark:border-gray-800 aspect-video w-full max-w-4xl"
        onMouseEnter={showControlsTemporarily}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* افکت گرادیان */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 z-10 pointer-events-none"></div>
        
        {/* عنوان ویدیو */}
        {title && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent z-20 p-4">
            <h3 className="text-white text-lg font-semibold text-center">{title}</h3>
          </div>
        )}

        {/* پلیر اصلی */}
        <div className="relative w-full h-full">
          <ReactPlayer
            ref={playerRef}
            url={url}
            width="100%"
            height="100%"
            playing={playerState.playing}
            muted={playerState.muted}
            volume={playerState.volume}
            playbackRate={playerState.playbackRate}
            playsinline
            onReady={handleReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onProgress={handleProgress}
            onDuration={handleDuration} // اصلاح شده: onDuration به onDuration
            onError={handleError}
            onEnded={onEnded}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload' as const,
                  crossOrigin: 'anonymous' as const,
                  poster: poster,
                },
                forceHLS: true,
                hlsOptions: {
                  enableWorker: true,
                  enableSoftwareAES: true,
                  lowLatencyMode: true,
                  backBufferLength: 90,
                  maxMaxBufferLength: 600,
                  maxBufferSize: 60 * 1000 * 1000,
                },
                tracks: vttTrackUrl ? [
                  {
                    kind: 'subtitles',
                    src: vttTrackUrl,
                    srcLang: 'en',
                    label: 'English & Persian',
                    default: true
                  }
                ] : []
              }
            }}
          />

          {/* کنترل‌های سفارشی */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 z-20 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* نوار پیشرفت */}
            <div className="mb-3">
              <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={playerState.played}
                onChange={handleSeekChange}
                onMouseUp={handleSeekMouseUp}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-white text-xs mt-1">
                <span>{formatTime(playerState.played * playerState.duration)}</span>
                <span>{formatTime(playerState.duration)}</span>
              </div>
            </div>

            {/* دکمه‌های کنترل */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {/* دکمه پلی/پاز */}
                <button
                  onClick={() => setPlayerState(prev => ({ ...prev, playing: !prev.playing }))}
                  className="text-white hover:text-cyan-400 transition-colors duration-200 p-1"
                  aria-label={playerState.playing ? 'توقف' : 'پخش'}
                >
                  {playerState.playing ? (
                    <span className="text-xl">⏸️</span>
                  ) : (
                    <span className="text-xl">▶️</span>
                  )}
                </button>

                {/* کنترل صدا */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-cyan-400 transition-colors duration-200 p-1"
                    aria-label={playerState.muted ? 'صدا دار' : 'بی صدا'}
                  >
                    {playerState.muted || playerState.volume === 0 ? (
                      <span className="text-xl">🔇</span>
                    ) : playerState.volume < 0.5 ? (
                      <span className="text-xl">🔈</span>
                    ) : (
                      <span className="text-xl">🔊</span>
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={playerState.volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                </div>

                {/* نمایش زمان */}
                <span className="text-white text-sm font-mono">
                  {formatTime(playerState.played * playerState.duration)} / {formatTime(playerState.duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {/* سرعت پخش */}
                <select
                  value={playerState.playbackRate}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPlayerState(prev => ({ 
                    ...prev, 
                    playbackRate: parseFloat(e.target.value) 
                  }))}
                  className="bg-gray-800 text-white px-2 py-1 rounded text-sm border border-gray-600 focus:outline-none focus:border-cyan-500"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                {/* دکمه تمام صفحه */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-cyan-400 transition-colors duration-200 p-1"
                  aria-label="حالت تمام صفحه"
                >
                  <span className="text-xl">⛶</span>
                </button>
              </div>
            </div>
          </div>

          {/* نمایش وضعیت لودینگ */}
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                <p className="text-lg">در حال بارگذاری ویدیو...</p>
              </div>
            </div>
          )}

          {/* دکمه پلی بزرگ در وسط */}
          {!playerState.playing && isReady && (
            <button
              onClick={() => setPlayerState(prev => ({ ...prev, playing: true }))}
              className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/30 transition-opacity duration-300 z-10"
              aria-label="پخش ویدیو"
            >
              <div className="bg-white/20 rounded-full p-8 backdrop-blur-sm border border-white/30">
                <span className="text-6xl text-white">▶️</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedVideoPlayer;