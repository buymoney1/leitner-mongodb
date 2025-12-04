// components/planner/ProfessionalPlanner.tsx
'use client';

import { useState, useEffect } from 'react';
import DailyGuide from './DailyGuide';
import QuickStats from './QuickStats';
import { CalendarDays, Target, CheckCircle2, Sparkles } from 'lucide-react';
import JalaliCalendarWithLibrary from './JalaliCalendarWithLibrary';

export default function ProfessionalPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [activities, setActivities] = useState({
    video: false,
    podcast: false,
    words: false,
    article: false
  });

  // محاسبه پیشرفت روزانه
  useEffect(() => {
    const completedActivities = Object.values(activities).filter(Boolean).length;
    const newProgress = (completedActivities / 4) * 100;
    setProgress(newProgress);
  }, [activities]);

  const toggleActivity = (activity: keyof typeof activities) => {
    setActivities(prev => ({
      ...prev,
      [activity]: !prev[activity]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* هدر */}
        <header className="mb-8">

          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                <CalendarDays className="text-blue-600 dark:text-blue-400" />
                پلنر حرفه‌ای روزانه
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                برنامه‌ریزی هوشمندانه برای رشد و توسعه روزانه
              </p>
            </div>

          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ستون سمت چپ */}
          <div className="lg:col-span-2 space-y-6">
    

            <QuickStats />
          
                   {/* تقویم */}
      
                   <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
      <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      تقویم فعالیت‌ها
    </h2>
    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        <span className="text-xs">روز کامل</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="text-xs">امروز</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-blue-500/30"></div>
        <span className="text-xs">انتخاب</span>
      </div>
    </div>
  </div>
  <JalaliCalendarWithLibrary currentDate={currentDate} onDateChange={setCurrentDate} />
</div>

          </div>

          {/* ستون سمت راست */}
          <div className="space-y-6">
       
        
            <DailyGuide />

            {/* کارت انگیزشی */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-15 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-gray-800 dark:text-white">نکته روز</h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                ثبات کلید موفقیت است. حتی در روزهای سخت، انجام کوچکترین فعالیت‌ها نیز شما را به هدفتان نزدیک‌تر می‌کند.
              </p>
  
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}