export type SubtitleMode = "both" | "persian" | "english" | "none";
export type VideoQuality = "auto" | "360p" | "480p" | "720p" | "1080p";

export interface Subtitle {
  startTime: number;
  endTime: number;
  englishText: string;
  persianText: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
}

export interface DictionaryData {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
    synonyms: string[];
  }[];
}

export interface PlayerState {
  playing: boolean;
  currentTime: number;
  duration: number;
  isFullScreen: boolean;
  showControls: boolean;
  videoHeight: number;
}

export interface SubtitleSettings {
  mode: SubtitleMode;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
}