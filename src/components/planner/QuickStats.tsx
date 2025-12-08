// components/planner/SimpleQuickStats.tsx
'use client';

import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Loader2, 
  Calendar, 
  BookOpen, 
  Headphones, 
  CheckCircle, 
  Zap 
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface DailyActivity {
  id: string;
  date: Date;
  videoWatched: boolean;
  podcastListened: boolean;
  wordsReviewed: boolean;
  articleRead: boolean;
  progress: number;
}

interface ActivityStats {
  videos: number;
  podcasts: number;
  articles: number;
  words: number;
  totalTime: string;
  streak: number;
  weeklyAverage: number;
  todaysProgress: number;
}

export default function SimpleQuickStats() {
  const [stats, setStats] = useState<ActivityStats>({
    videos: 0,
    podcasts: 0,
    articles: 0,
    words: 0,
    totalTime: '0 دقیقه',
    streak: 0,
    weeklyAverage: 0,
    todaysProgress: 0
  });

  const [todaysActivity, setTodaysActivity] = useState<DailyActivity | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // تنظیم تاریخ فقط در کلاینت
    const today = new Date();
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    const toPersianDigits = (num: number): string => {
      return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
    };
    
    const gregorianYear = today.getFullYear();
    const gregorianMonth = today.getMonth() + 1;
    const gregorianDay = today.getDate();
    
    // تبدیل ساده
    let persianYear = gregorianYear - 621;
    let persianMonth = gregorianMonth;
    let persianDay = gregorianDay;
    
    // تنظیم ماه
    if (persianMonth > 6) {
      persianMonth -= 6;
    } else {
      persianMonth += 6;
    }
    
    setCurrentDate(`${toPersianDigits(persianYear)}/${toPersianDigits(persianMonth)}/${toPersianDigits(persianDay)}`);
    
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const [statsRes, todayRes, activitiesRes] = await Promise.all([
        fetch('/api/planner/stats'),
        fetch('/api/planner/today'),
        fetch('/api/planner/recent-activities?limit=5')
      ]);
  
      const statsData = await statsRes.json();
      const todayData = await todayRes.json();
      const activitiesData = await activitiesRes.json();
  
      if (statsData.success) {
        const totalMinutes = Math.floor(statsData.data.totalTime / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        const timeSpent = hours > 0 
          ? `${hours} ساعت و ${minutes} دقیقه`
          : `${minutes} دقیقه`;
  
        setStats({
          videos: statsData.data.totalActivities?.videos || 0,
          podcasts: statsData.data.totalActivities?.podcasts || 0,
          articles: statsData.data.totalActivities?.articles || 0,
          words: statsData.data.totalActivities?.words || 0,
          totalTime: timeSpent,
          streak: statsData.data.streak || 0,
          weeklyAverage: statsData.data.weeklyAverage || 0,
          todaysProgress: statsData.data.todaysProgress || 0
        });
  
        if (todayData.success && todayData.data) {
          setTodaysActivity(todayData.data);
        }

        if (activitiesData.success) {
          setRecentActivities(activitiesData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'video': return BookOpen;
      case 'podcast': return Headphones;
      case 'article': return Calendar;
      case 'words': return Zap;
      default: return CheckCircle;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'video': return 'text-red-600 dark:text-red-400';
      case 'podcast': return 'text-purple-600 dark:text-purple-400';
      case 'article': return 'text-blue-600 dark:text-blue-400';
      case 'words': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case 'video': return 'ویدیو';
      case 'podcast': return 'پادکست';
      case 'article': return 'مقاله';
      case 'words': return 'لغات';
      default: return 'فعالیت';
    }
  };

  const formatActivityTime = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    const toPersianDigits = (num: number): string => {
      return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
    };
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    return `${toPersianDigits(hours)}:${toPersianDigits(minutes)}`;
  };

  const statsData = [
    {
      icon: Clock,
      label: 'زمان مطالعه',
      value: stats.totalTime,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      description: 'مجموع زمان ردیابی شده'
    },
    {
      icon: Target,
      label: 'پیشرفت امروز',
      value: `${stats.todaysProgress}%`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      description: 'اهداف امروز'
    },
    {
      icon: TrendingUp,
      label: 'میانگین هفتگی',
      value: `${Math.round(stats.weeklyAverage)}%`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      description: 'این هفته'
    },
    {
      icon: Award,
      label: 'روز متوالی',
      value: formatNumber(stats.streak),
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      description: 'فعالیت روزانه'
    }
  ];

  const activityStats = [
    {
      icon: BookOpen,
      label: 'ویدیو',
      value: formatNumber(stats.videos),
      completed: todaysActivity?.videoWatched || false,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: Headphones,
      label: 'پادکست',
      value: formatNumber(stats.podcasts),
      completed: todaysActivity?.podcastListened || false,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Calendar,
      label: 'مقاله',
      value: formatNumber(stats.articles),
      completed: todaysActivity?.articleRead || false,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Zap,
      label: 'لغات',
      value: formatNumber(stats.words),
      completed: todaysActivity?.wordsReviewed || false,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <div className="
      bg-white
      dark:bg-gray-800
      rounded-2xl
      shadow-lg
      dark:shadow-xl
      dark:shadow-black/20
      p-6
      border
      border-gray-200
      dark:border-gray-700
      transition-all
      duration-300
      hover:shadow-xl
      hover:shadow-gray-300/40
      dark:hover:shadow-black/30
    ">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            آمار فعالیت‌ها
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            بر اساس سیستم ردیابی خودکار
          </p>
        </div>
        {isLoading && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        )}
      </div>
      
      {/* آمار اصلی */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className={`
                p-4
                rounded-xl
                border
                ${stat.borderColor}
                ${stat.bgColor}
                transition-all
                duration-300
                hover:scale-105
                hover:shadow-md
                ${isLoading ? 'opacity-70' : ''}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1">
                  {index === 1 && todaysActivity && (
                    <span className="text-xs font-medium px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                      {todaysActivity.progress >= 100 ? 'تکمیل شده' : 'در حال پیشرفت'}
                    </span>
                  )}
                </div>
              </div>
              <div className={`
                text-2xl
                font-bold
                ${isLoading ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}
              `}>
                {isLoading ? '...' : stat.value}
              </div>
              <div className="
                text-sm
                text-gray-600
                dark:text-gray-400
                mt-1
              ">
                {stat.label}
              </div>
              <div className="
                text-xs
                text-gray-500
                dark:text-gray-500
                mt-2
              ">
                {stat.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* وضعیت فعالیت‌های امروز */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          وضعیت امروز ({currentDate || 'در حال بارگذاری...'})
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {activityStats.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div 
                key={index}
                className={`
                  text-center
                  p-3
                  rounded-lg
                  ${activity.bgColor}
                  border
                  ${activity.completed 
                    ? 'border-green-500/30 dark:border-green-400/30' 
                    : 'border-gray-200 dark:border-gray-700'
                  }
                  transition-all
                  duration-300
                  hover:scale-105
                `}
              >
                <div className="flex justify-center mb-2 relative">
                  <Icon className={`w-5 h-5 ${activity.color}`} />
                  {activity.completed && (
                    <CheckCircle className="w-3 h-3 text-green-500 absolute -top-1 -right-1" />
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {activity.label}
                </div>
                <div className={`text-xs mt-1 ${activity.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                  {activity.completed ? '✓ انجام شده' : '● در انتظار'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* فعالیت‌های اخیر */}
      {recentActivities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            فعالیت‌های اخیر
          </h3>
          <div className="space-y-2">
            {recentActivities.slice(0, 3).map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.activityType);
              const activityColor = getActivityColor(activity.activityType);
              const activityLabel = getActivityLabel(activity.activityType);
              
              return (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${activityColor.replace('text-', 'bg-')}/10`}>
                      <ActivityIcon className={`w-3.5 h-3.5 ${activityColor}`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {activityLabel}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {formatActivityTime(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {Math.floor(activity.duration / 60)} دقیقه
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}