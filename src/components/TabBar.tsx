interface TabBarProps {
  activeTab: 'subtitles' | 'vocabulary';
  vocabularyCount: number;
  onTabChange: (tab: 'subtitles' | 'vocabulary') => void;
}

export default function TabBar({ activeTab, vocabularyCount, onTabChange }: TabBarProps) {
  return (
    <div className="flex bg-slate-800/60 backdrop-blur-md rounded-xl p-1 border border-slate-700/50 shadow-lg shadow-slate-900/20">
      <button
        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
          activeTab === 'subtitles' 
            ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/40'
        }`}
        onClick={() => onTabChange('subtitles')}
      >
        {/* Active indicator */}
        {activeTab === 'subtitles' && (
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-400 rounded-full"></span>
        )}
        
        {/* Hover effect */}
        <span className={`absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 transition-opacity duration-300 ${
          activeTab === 'subtitles' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}></span>
        
        <span className="text-xs relative flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          زیرنویس‌ها
        </span>
      </button>
      
      <button
        className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
          activeTab === 'vocabulary' 
            ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/10 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10' 
            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/40'
        }`}
        onClick={() => onTabChange('vocabulary')}
      >
        {/* Active indicator */}
        {activeTab === 'vocabulary' && (
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-purple-400 rounded-full"></span>
        )}
        
        {/* Hover effect */}
        <span className={`absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/5 transition-opacity duration-300 ${
          activeTab === 'vocabulary' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}></span>
        
        <span className="text-xs relative flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          لغت و عبارت‌های مهم
          {vocabularyCount > 0 && (
            <span className={`absolute -top-1.5 -right-1.5 text-xs font-bold flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full transition-all duration-300 ${
              activeTab === 'vocabulary' 
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/30' 
                : 'bg-slate-700 text-slate-300 border border-slate-600'
            }`}>
              {vocabularyCount}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}