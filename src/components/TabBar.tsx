interface TabBarProps {
  activeTab: 'subtitles' | 'vocabulary';
  vocabularyCount: number;
  onTabChange: (tab: 'subtitles' | 'vocabulary') => void;
}

export default function TabBar({ activeTab, vocabularyCount, onTabChange }: TabBarProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
      <button
        className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200 ${
          activeTab === 'subtitles' 
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
        }`}
        onClick={() => onTabChange('subtitles')}
      >
        زیرنویس‌ها
      </button>
      <button
        className={`flex-1 py-2 px-4 rounded-lg text-xs font-medium transition-all duration-200 relative ${
          activeTab === 'vocabulary' 
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
        }`}
        onClick={() => onTabChange('vocabulary')}
      >
        لغت و عبارت های مهم
        {vocabularyCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 dark:bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
            {vocabularyCount}
          </span>
        )}
      </button>
    </div>
  );
}