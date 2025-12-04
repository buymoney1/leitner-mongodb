import { X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
}

interface PlayerBarProps {
  song: Song;
  onClose: () => void;
  formatDuration: (seconds: number) => string;
}

export default function PlayerBar({ 
  song, 
  onClose,
  formatDuration 
}: PlayerBarProps) {
  return (
    <AudioPlayer
      audioUrl={song.audioUrl}
      songTitle={song.title}
      artist={song.artist}
      coverUrl={song.coverUrl}
      onClose={onClose}
      formatDuration={formatDuration}
    />
  );
}