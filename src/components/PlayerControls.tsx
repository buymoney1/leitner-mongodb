import { PlayIcon, PauseIcon, FullScreenIcon, ExitFullScreenIcon, SettingsIcon } from './icons';
import { formatTime } from '../utils';

interface PlayerControlsProps {
  playing: boolean;
  currentTime: number;
  duration: number;
  isFullScreen: boolean;
  showControls: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onFullScreen: () => void;
  onShowSettings: () => void;
}

export default function PlayerControls({
  playing,
  currentTime,
  duration,
  isFullScreen,
  showControls,
  onPlayPause,
  onSeek,
  onFullScreen,
  onShowSettings
}: PlayerControlsProps) {
  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 z-20 py-3 flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      dir="ltr"
    >
      <button 
        onClick={onPlayPause} 
        className="bg-transparent border-none cursor-pointer p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
      >
        {playing ? <PauseIcon/> : <PlayIcon/>}
      </button>

      <span className="text-white text-sm font-mono min-w-[80px]">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      <input 
        type="range" 
        min={0} 
        max={duration} 
        step="any" 
        value={currentTime} 
        onChange={e => onSeek(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
      />

      <button 
        onClick={onShowSettings} 
        className="bg-transparent border-none cursor-pointer p-2 hover:bg-white/20 rounded-full transition-all duration-200"
        title="تنظیمات"
      >
        <SettingsIcon />
      </button>

      <button 
        onClick={onFullScreen} 
        className="bg-transparent border-none cursor-pointer p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
      >
        {isFullScreen ? <ExitFullScreenIcon/> : <FullScreenIcon/>}
      </button>
    </div>
  );
}