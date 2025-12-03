import { Subtitle } from '../types';

export const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "360p", label: "360p" },
  { value: "480p", label: "480p" },
  { value: "720p", label: "720p" },
  { value: "1080p", label: "1080p" }
];

export const PRESET_COLORS = ["#000000", "#ffffff"];

export const parseVTT = (content: string): Subtitle[] => {
  const lines = content.split('\n');
  const subs: Subtitle[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('-->')) {
      const [start, end] = lines[i].split('-->');
      const english = lines[++i]?.trim() || '';
      const persian = lines[++i]?.trim() || '';
      if (english || persian) {
        subs.push({
          startTime: vttTimeToSeconds(start.trim()),
          endTime: vttTimeToSeconds(end.trim()),
          englishText: english,
          persianText: persian
        });
      }
    }
  }
  return subs;
};

export const vttTimeToSeconds = (time: string) => {
  const parts = time.split(':');
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) {
    h = parseInt(parts[0]); m = parseInt(parts[1]); s = parseFloat(parts[2].replace(',', '.'));
  } else {
    m = parseInt(parts[0]); s = parseFloat(parts[1].replace(',', '.'));
  }
  return h * 3600 + m * 60 + s;
};

export const formatTime = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  return `${mm}:${ss}`;
};

export const extractWords = (text: string): string[] => {
  const words = text.split(/\s+/);
  const englishWords: string[] = [];
  
  words.forEach(word => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    
    if (cleanWord.length > 2 && /^[a-zA-Z]+$/.test(cleanWord)) {
      englishWords.push(cleanWord);
    }
  });
  
  return englishWords;
};