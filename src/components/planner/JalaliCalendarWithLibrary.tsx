'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js';

interface JalaliCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

interface CalendarActivity {
  date: string;
  progress: number;
  activities: {
    video: boolean;
    podcast: boolean;
    words: boolean;
    article: boolean;
  };
}

export default function JalaliCalendarWithLibrary({ currentDate, onDateChange }: JalaliCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(currentDate);
  const [calendarData, setCalendarData] = useState<CalendarActivity[]>([]);
  const [monthStats, setMonthStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // تبدیل به تاریخ شمسی
  const jalaliDate = toJalaali(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    currentMonth.getDate()
  );
  
  // روزهای هفته فارسی (شنبه شروع)
  const days = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  
  // نام ماه‌های شمسی
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  // تعداد روزهای ماه جاری شمسی
  const daysInMonth = jalaaliMonthLength(jalaliDate.jy, jalaliDate.jm);
  
  // اولین روز ماه در تقویم (شنبه = 0)
  const firstDayOfMonthGregorian = toGregorian(jalaliDate.jy, jalaliDate.jm, 1);
  const firstDayOfMonth = new Date(
    firstDayOfMonthGregorian.gy,
    firstDayOfMonthGregorian.gm - 1,
    firstDayOfMonthGregorian.gd
  ).getDay();
  
  // تبدیل به روز هفته ایرانی (شنبه = 0)
  const firstDayOfWeek = (firstDayOfMonth + 1) % 7;
  
  const today = new Date();
  const todayJalali = toJalaali(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );
  
  const selectedJalali = toJalaali(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    currentDate.getDate()
  );

  // فراخوانی API تقویم وقتی ماه تغییر می‌کند
  useEffect(() => {
    fetchCalendarData();
  }, [jalaliDate.jy, jalaliDate.jm]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const year = jalaliDate.jy;
      const month = jalaliDate.jm;
      
      const response = await fetch(`/api/planner/calendar?year=${year}&month=${month}`);
      const data = await response.json();
      
      if (data.success) {
        setCalendarData(data.data.calendar || []);
        setMonthStats(data.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isToday = (day: number) => {
    return (
      day === todayJalali.jd &&
      jalaliDate.jm === todayJalali.jm &&
      jalaliDate.jy === todayJalali.jy
    );
  };
  
  const isSelected = (day: number) => {
    return (
      day === selectedJalali.jd &&
      jalaliDate.jm === selectedJalali.jm &&
      jalaliDate.jy === selectedJalali.jy
    );
  };

  const getDayActivity = (day: number) => {
    const gregorian = toGregorian(jalaliDate.jy, jalaliDate.jm, day);
    const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    
    // جستجو در calendarData برای فعالیت‌های این روز
    const activity = calendarData.find((item: CalendarActivity) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getDate() === date.getDate() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getFullYear() === date.getFullYear()
      );
    });
    
    return activity;
  };

  // تابع جدید: بررسی آیا روز کامل شده (100% پیشرفت)
  const isDayComplete = (day: number) => {
    const activity = getDayActivity(day);
    return activity?.progress === 100;
  };

  const getActivityColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (progress < 25) return 'bg-red-200 dark:bg-red-900/30';
    if (progress < 50) return 'bg-orange-200 dark:bg-orange-900/30';
    if (progress < 75) return 'bg-yellow-200 dark:bg-yellow-900/30';
    if (progress < 100) return 'bg-green-200 dark:bg-green-900/30';
    return 'bg-emerald-500 dark:bg-emerald-600'; // سبز پررنگ برای 100%
  };

  const getDayBackgroundColor = (day: number) => {
    const activity = getDayActivity(day);
    if (!activity) return '';
    
    if (isDayComplete(day)) {
      return 'bg-emerald-100 dark:bg-emerald-900/40'; // پس‌زمینه سبز برای روزهای کامل
    }
    
    return getActivityColor(activity.progress);
  };

  const getActivityIcon = (day: number) => {
    const activity = getDayActivity(day);
    if (!activity) return null;
    
    if (isDayComplete(day)) {
      return (
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      );
    }
    
    if (activity.progress > 0 && activity.progress < 100) {
      return (
        <div className="w-1 h-1 rounded-full bg-amber-500"></div>
      );
    }
    
    return null;
  };
  
  const handleDayClick = (day: number) => {
    const gregorian = toGregorian(jalaliDate.jy, jalaliDate.jm, day);
    const newDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    onDateChange(newDate);
  };
  
  const nextMonth = () => {
    let newMonth = jalaliDate.jm + 1;
    let newYear = jalaliDate.jy;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    
    const gregorian = toGregorian(newYear, newMonth, 1);
    const newDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    setCurrentMonth(newDate);
  };
  
  const prevMonth = () => {
    let newMonth = jalaliDate.jm - 1;
    let newYear = jalaliDate.jy;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    
    const gregorian = toGregorian(newYear, newMonth, 1);
    const newDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    setCurrentMonth(newDate);
  };
  
  // تولید روزهای ماه
  const renderDays = () => {
    const daysArray = [];
    
    // روزهای خالی ابتدای ماه (بر اساس شنبه)
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-12"></div>);
    }
    
    // روزهای ماه
    for (let day = 1; day <= daysInMonth; day++) {
      const today = isToday(day);
      const selected = isSelected(day);
      const complete = isDayComplete(day);
      const activity = getDayActivity(day);
      const progress = activity?.progress || 0;
      const dayBackgroundColor = getDayBackgroundColor(day);
      const activityIcon = getActivityIcon(day);
      
      daysArray.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`
            h-12 flex flex-col items-center justify-center relative rounded-lg transition-all duration-200
            ${selected 
              ? 'bg-blue-900 text-white shadow-lg transform scale-105' 
              : today 
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-2 border-blue-500/30' 
                : complete
                  ? 'text-emerald-800 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-800/40'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }
            ${complete && !selected ? 'border border-emerald-300 dark:border-emerald-700' : ''}
          `}
        >
          {/* پس‌زمینه رنگی برای نشان دادن پیشرفت */}
          {activity && progress > 0 && !selected && !complete && (
            <div className={`
              absolute inset-1 rounded-lg opacity-30 pointer-events-none
              ${dayBackgroundColor}
            `} />
          )}
          
          {/* پس‌زمینه سبز برای روزهای کامل */}
          {complete && !selected && (
            <div className={`
              absolute inset-1 rounded-lg opacity-20 pointer-events-none
              bg-emerald-400 dark:bg-emerald-700
            `} />
          )}
          
          <span className={`
            font-medium relative z-10
            ${selected 
              ? 'text-white' 
              : complete
                ? 'text-emerald-800 dark:text-emerald-200 font-bold'
                : today
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-800 dark:text-gray-200'
            }
          `}>
            {day}
          </span>
          
          {/* نشانگر فعالیت */}
          {activity && (
            <div className="mt-1 flex items-center gap-0.5 relative z-10">
              {activityIcon}
              {!complete && activity.activities.video && (
                <div className="w-1 h-1 rounded-full bg-red-500"></div>
              )}
              {!complete && activity.activities.podcast && (
                <div className="w-1 h-1 rounded-full bg-purple-500"></div>
              )}
              {!complete && activity.activities.words && (
                <div className="w-1 h-1 rounded-full bg-green-500"></div>
              )}
              {!complete && activity.activities.article && (
                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
              )}
              
              {/* تیک سبز برای روزهای کامل */}
              {complete && (
                <CheckCircle2 className="w-2 h-2 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
          )}
          
          {/* نشانگر امروز */}
          {today && !selected && !complete && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></div>
          )}
        </button>
      );
    }
    
    return daysArray;
  };
  
  return (
    <div className="w-full">
      {/* هدر تقویم */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {monthNames[jalaliDate.jm - 1]} {jalaliDate.jy}
          </h3>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={loading}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          )}
          <button 
            onClick={() => onDateChange(new Date())}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-600 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <CalendarIcon className="w-4 h-4" />
            امروز
          </button>
        </div>
      </div>
      
      {/* روزهای هفته */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((day) => (
          <div 
            key={day} 
            className="h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* روزهای ماه */}
      <div className="grid grid-cols-7 gap-2">
        {renderDays()}
      </div>

      {/* آمار ماهانه */}
      {monthStats && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                {monthStats.activeDays || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                روز فعال
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                {monthStats.perfectDays || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                روز کامل
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                {Math.round(monthStats.averageProgress || 0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                میانگین پیشرفت
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                {monthStats.totalVideos || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ویدیو
              </div>
            </div>
          </div>
          
          {/* راهنمای رنگ‌ها */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-center flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-gray-600 dark:text-gray-400">روز کامل</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-gray-600 dark:text-gray-400">ویدیو</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-gray-600 dark:text-gray-400">پادکست</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-gray-600 dark:text-gray-400">لغات</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">مقاله</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">امروز</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}