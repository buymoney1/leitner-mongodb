// types/video.ts
export interface VideoPlayerProps {
    url: string;
    autoPlay?: boolean;
    controls?: boolean;
    muted?: boolean;
    loop?: boolean;
    poster?: string;
    title?: string;
    onReady?: () => void;
    onError?: (error: any) => void;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    onEnded?: () => void;
  }
  
  export interface PlayerState {
    playing: boolean;
    muted: boolean;
    volume: number;
    played: number;
    loaded: number;
    duration: number;
    seeking: boolean;
    playbackRate: number;
    loop: boolean;
    fullscreen: boolean;
  }

  export interface Vocabulary {
    id: string;
    word: string;
    meaning: string;
    videoId: string;
  }
  
  export interface VideoData {
    id: string;
    title: string;
    description: string | null;
    videoUrl: string;
    thumbnailUrl: string | null;
    level: string;
    subtitlesVtt: string | null;
    vocabularies: Vocabulary[];
  }