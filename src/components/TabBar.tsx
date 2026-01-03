interface TabBarProps {
  activeTab: 'subtitles' | 'vocabulary';
  vocabularyCount: number;
  onTabChange: (tab: 'subtitles' | 'vocabulary') => void;
}

export default function TabBar({ activeTab, vocabularyCount, onTabChange }: TabBarProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-slate-800/40 backdrop-blur-sm rounded-lg p-1 border border-gray-200 dark:border-slate-700/50 shadow-sm">
      <button
        className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 relative ${
          activeTab === 'subtitles' 
            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-300 dark:border-slate-600' 
            : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-700/30'
        }`}
        onClick={() => onTabChange('subtitles')}
      >
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>زیرنویس‌ها</span>
        </div>
      </button>
      
      <button
        className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 relative ${
          activeTab === 'vocabulary' 
            ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm border border-gray-300 dark:border-slate-600' 
            : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-gray-200/50 dark:hover:bg-slate-700/30'
        }`}
        onClick={() => onTabChange('vocabulary')}
      >
        <div className="flex items-center justify-center gap-1.5 relative">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>لغات</span>
          {vocabularyCount > 0 && (
            <span className={`absolute -top-1 -left-1 text-[10px] font-bold flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full ${
              activeTab === 'vocabulary' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-slate-300'
            }`}>
              {vocabularyCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}