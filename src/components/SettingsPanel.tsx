
import { TextTabIcon, VideoTabIcon, GradientIcon, CloseIcon } from './icons';
import { QUALITY_OPTIONS, PRESET_COLORS } from '../utils';
import { SubtitleSettings, VideoQuality } from '../../types';

interface SettingsPanelProps {
  isOpen: boolean;
  activeTab: 'subtitles' | 'vocabulary';
  subtitleSettings: SubtitleSettings;
  videoQuality: VideoQuality;
  onClose: () => void;
  onTabChange: (tab: 'subtitles' | 'vocabulary') => void;
  onSubtitleSettingsChange: (settings: SubtitleSettings) => void;
  onVideoQualityChange: (quality: VideoQuality) => void;
}

export default function SettingsPanel({
  isOpen,
  activeTab,
  subtitleSettings,
  videoQuality,
  onClose,
  onTabChange,
  onSubtitleSettingsChange,
  onVideoQualityChange
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const handleSubtitleModeChange = (mode: SubtitleSettings['mode']) => {
    onSubtitleSettingsChange({ ...subtitleSettings, mode });
  };

  const handleFontSizeChange = (fontSize: number) => {
    onSubtitleSettingsChange({ ...subtitleSettings, fontSize });
  };

  const handleBackgroundColorChange = (color: string) => {
    onSubtitleSettingsChange({ ...subtitleSettings, backgroundColor: color + "B3" });
  };

  const handleTextColorChange = (color: string) => {
    onSubtitleSettingsChange({ ...subtitleSettings, textColor: color });
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => { 
        if(e.target === e.currentTarget) onClose(); 
      }}
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] min-h-[60vh] animate-in zoom-in duration-200 mx-auto">
        {/* تب‌ها */}
        <div className="flex border-b border-gray-200 bg-gray-50/50" dir="rtl">
          <button 
            onClick={() => onTabChange('subtitles')}
            className={`flex-1 py-3 text-xs font-bold flex justify-center items-center gap-2 transition-all duration-200 ${
              activeTab === 'subtitles' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm' 
                : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
            }`}
          >
            <TextTabIcon /> 
            <span className="text-[10px] sm:text-xs">تنظیمات متن</span>
          </button>
          <button 
            onClick={() => onTabChange('vocabulary')}
            className={`flex-1 py-3 text-xs font-bold flex justify-center items-center gap-2 transition-all duration-200 ${
              activeTab === 'vocabulary' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-sm' 
                : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
            }`}
          >
            <VideoTabIcon /> 
            <span className="text-[10px] sm:text-xs">کیفیت ویدیو</span>
          </button>
        </div>

        {/* محتوای اسکرول‌خور */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar" dir="rtl">
          
          {/* تب زیرنویس */}
          {activeTab === 'subtitles' && (
            <div className="space-y-4 sm:space-y-5">
              {/* حالت نمایش */}
              <div className="space-y-2 sm:space-y-3">
                <span className="text-xs text-gray-700 font-semibold block">حالت نمایش زیرنویس</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] sm:grid-cols-4 sm:gap-1">
                  {[
                    { val: 'both', label: 'فارسی + انگلیسی' },
                    { val: 'persian', label: 'فقط فارسی' },
                    { val: 'english', label: 'فقط انگلیسی' },
                    { val: 'none', label: 'غیرفعال' }
                  ].map(opt => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSubtitleModeChange(opt.val as any)}
                      className={`py-2 px-1 rounded-xl border-2 transition-all duration-200 text-[10px] sm:text-[10px] ${
                        subtitleSettings.mode === opt.val 
                          ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* سایز فونت */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-700 font-semibold">اندازه متن</span>
                  <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-bold">
                    {subtitleSettings.fontSize}px
                  </span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="30" 
                  value={subtitleSettings.fontSize} 
                  onChange={e => handleFontSizeChange(+e.target.value)} 
                  className="w-full h-2 sm:h-3 accent-blue-500 bg-gray-200 rounded-lg appearance-none cursor-pointer hover:accent-blue-600 transition-all"
                />
                <div className="flex justify-between text-[10px] text-gray-500 px-1">
                  <span>کوچک</span>
                  <span>متوسط</span>
                  <span>بزرگ</span>
                </div>
              </div>

              {/* رنگ‌ها */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                {/* رنگ زمینه */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-700 font-semibold block">رنگ زمینه</span>
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                    {PRESET_COLORS.map(c => (
                      <button 
                        key={c} 
                        onClick={() => handleBackgroundColorChange(c)}
                        className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 shadow-md transition-all duration-200 hover:scale-110 ${
                          subtitleSettings.backgroundColor.startsWith(c) 
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 border-white' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{backgroundColor: c}}
                        title={c}
                      />
                    ))}
                    <div className="relative w-6 h-6 sm:w-5 sm:h-5 rounded-full overflow-hidden shadow-md cursor-pointer border-2 border-gray-300 hover:scale-110 transition-all">
                      <GradientIcon />
                      <input 
                        type="color" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                        onChange={e => handleBackgroundColorChange(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* رنگ متن */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-700 font-semibold block">رنگ متن</span>
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                    {PRESET_COLORS.map(c => (
                      <button 
                        key={c} 
                        onClick={() => handleTextColorChange(c)}
                        className={`w-6 h-6 sm:w-5 sm:h-5 rounded-full border-2 shadow-md transition-all duration-200 hover:scale-110 ${
                          subtitleSettings.textColor === c 
                            ? 'ring-2 ring-offset-2 ring-blue-500 scale-110 border-white' 
                            : 'border-gray-300 hover:border-gray-400'
                        } ${c === '#ffffff' ? 'border-gray-300' : ''}`}
                        style={{backgroundColor: c}}
                        title={c}
                      />
                    ))}
                    <div className="relative w-6 h-6 sm:w-5 sm:h-5 rounded-full overflow-hidden shadow-md cursor-pointer border-2 border-gray-300 hover:scale-110 transition-all">
                      <GradientIcon />
                      <input 
                        type="color" 
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                        onChange={e => handleTextColorChange(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تب ویدیو */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-4">
              <span className="text-sm text-gray-700 font-semibold block">کیفیت پخش ویدیو</span>
              <div className="flex flex-col gap-2">
                {QUALITY_OPTIONS.map(q => (
                  <button
                    key={q.value}
                    onClick={() => onVideoQualityChange(q.value as VideoQuality)}
                    className={`py-3 px-4 rounded-xl text-right transition-all duration-200 flex justify-between items-center border-2 text-[12px] font-medium ${
                      videoQuality === q.value 
                        ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-md' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:bg-blue-25'
                    }`}
                  >
                    <span>{q.label}</span>
                    {videoQuality === q.value && (
                      <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm animate-pulse"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* دکمه بستن برای موبایل */}
        <div className="p-4 border-t border-gray-200 sm:hidden">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors duration-200"
          >
            تایید و بستن
          </button>
        </div>
      </div>
    </div>
  );
}