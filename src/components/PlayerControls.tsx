import { 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Settings,
  SkipBack,
  SkipForward 
} from 'lucide-react';
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
  onSkipBackward?: () => void;
  onSkipForward?: () => void;
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
  onShowSettings,
  onSkipBackward,
  onSkipForward
}: PlayerControlsProps) {
  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 z-20 py-3 flex items-center gap-1 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
      dir="ltr"
    >
      {/* Skip Backward Button */}
      {onSkipBackward && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSkipBackward();
          }} 
          className="cursor-pointer border-0 transition-all leading-[0] p-2 text-white bg-transparent rounded-md hover:bg-white/10 active:scale-95"
          title="۱۰ ثانیه عقب"
        >
          <div className="relative leading-[0]">
            <SkipBack className="stroke-white w-4 h-4 transition-all stroke-[2.5]" />
          </div>
        </button>
      )}

      {/* Play/Pause Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onPlayPause();
        }} 
        className="cursor-pointer border-0 transition-all leading-[0] p-3 text-white bg-transparent rounded-md hover:bg-white/10 active:scale-95"
        title={playing ? "توقف" : "پخش"}
      >
        <div className="relative leading-[0]">
          {playing ? (
            <Pause className="stroke-white w-5 h-5 transition-all stroke-[2.5]" />
          ) : (
            <Play className="stroke-white w-5 h-5 transition-all stroke-[2.5]" />
          )}
        </div>
      </button>

      {/* Skip Forward Button */}
      {onSkipForward && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSkipForward();
          }} 
          className="cursor-pointer border-0 transition-all leading-[0] p-2 text-white bg-transparent rounded-md hover:bg-white/10 active:scale-95"
          title="۱۰ ثانیه جلو"
        >
          <div className="relative leading-[0]">
            <SkipForward className="stroke-white w-4 h-4 transition-all stroke-[2.5]" />
          </div>
        </button>
      )}

      {/* Current Time */}
      <span className="text-white text-sm font-mono min-w-[80px] ml-1">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Progress Bar */}
      <input 
        type="range" 
        min={0} 
        max={duration} 
        step="any" 
        value={currentTime} 
        onChange={e => onSeek(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
      />

      {/* Settings Button */}
      <button 
        onClick={onShowSettings} 
        className="bg-transparent border-none cursor-pointer p-2 hover:bg-white/20 rounded-full transition-all duration-200"
        title="تنظیمات"
      >
        <Settings className="w-5 h-5 text-white" />
      </button>

      {/* Fullscreen Button */}
      <button 
        onClick={onFullScreen} 
        className="bg-transparent border-none cursor-pointer p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
      >
        {isFullScreen ? (
          <Minimize2 className="w-5 h-5 text-white" />
        ) : (
          <Maximize2 className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}