// components/HLSPlayer.tsx
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer, { ReactPlayerProps } from 'react-player';
import { VideoPlayerProps } from '../../types/video';


const HLSPlayer: React.FC<VideoPlayerProps> = ({
  url,
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  onReady,
  onError,
  onProgress,
  onEnded
}) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [volume, setVolume] = useState<number>(0.8);
  const playerRef = useRef<ReactPlayer>(null);

  const handleReady = (): void => {
    setIsReady(true);
    onReady?.();
  };

  const handleError = (error: any): void => {
    console.error('خطا در پخش ویدیو:', error);
    onError?.(error);
  };

  return (
    <div className="relative w-full h-full">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        playing={isPlaying}
        controls={controls}
        muted={muted}
        loop={loop}
        volume={volume}
        playsinline
        onReady={handleReady}
        onError={handleError}
        onProgress={onProgress}
        onEnded={onEnded}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload' as const,
              crossOrigin: 'anonymous' as const,
            },
            forceHLS: true,
            hlsOptions: {
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90,
              maxBufferSize: 60 * 1000 * 1000,
              maxBufferLength: 30,
            }
          }
        }}
      />
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white">در حال بارگذاری ویدیو...</div>
        </div>
      )}
    </div>
  );
};

export default HLSPlayer;