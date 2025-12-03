interface TabBarProps {
    activeTab: 'subtitles' | 'vocabulary';
    vocabularyCount: number;
    onTabChange: (tab: 'subtitles' | 'vocabulary') => void;
  }
  
  export default function TabBar({ activeTab, vocabularyCount, onTabChange }: TabBarProps) {
    return (
      <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeTab === 'subtitles' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => onTabChange('subtitles')}
        >
          زیرنویس‌ها
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeTab === 'vocabulary' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => onTabChange('vocabulary')}
        >
          لغت و عبارت های مهم
        </button>
      </div>
    );
  }