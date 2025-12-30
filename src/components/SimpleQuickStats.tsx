// components/planner/SimpleQuickStats.tsx
'use client';

import { 
  Clock, 
  Target, 
  Award, 
  Loader2, 
  BookOpen, 
  Headphones, 
  Calendar, 
  Zap,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import moment from 'jalali-moment';

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
  totalTime: number;
  streak: number;
  todaysProgress: number;
}

interface SimpleQuickStatsProps {
  className?: string;
}

export default function SimpleQuickStats({ className = '' }: SimpleQuickStatsProps) {
  const [stats, setStats] = useState<ActivityStats>({
    videos: 0,
    podcasts: 0,
    articles: 0,
    words: 0,
    totalTime: 0,
    streak: 0,
    todaysProgress: 0
  });

  const [todaysActivity, setTodaysActivity] = useState<DailyActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateDate = () => {
      const now = moment();
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const jalaliDate = now.locale('fa').format('jYYYY/jMM/jDD');
      const persianDate = jalaliDate.replace(/\d/g, (d) => persianDigits[parseInt(d)]);
      setCurrentDate(persianDate);
    };

    updateDate();
    
    fetchStats();
    
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        updateDate();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const [statsRes, todayRes] = await Promise.all([
        fetch('/api/planner/stats'),
        fetch('/api/planner/today')
      ]);

      if (!statsRes.ok || !todayRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const statsData = await statsRes.json();
      const todayData = await todayRes.json();

      if (statsData.success) {
        setStats({
          videos: statsData.data.totalActivities?.videos || 0,
          podcasts: statsData.data.totalActivities?.podcasts || 0,
          articles: statsData.data.totalActivities?.articles || 0,
          words: statsData.data.totalActivities?.words || 0,
          totalTime: statsData.data.totalTime || 0,
          streak: statsData.data.streak || 0,
          todaysProgress: statsData.data.todaysProgress || 0
        });
      }

      if (todayData.success && todayData.data) {
        setTodaysActivity(todayData.data);
      }

    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        videos: 0,
        podcasts: 0,
        articles: 0,
        words: 0,
        totalTime: 0,
        streak: 0,
        todaysProgress: 0
      });
      setTodaysActivity(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
  };

  const formatTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${formatNumber(hours)}:${formatNumber(minutes)}`;
    } else if (hours > 0) {
      return `${formatNumber(hours)}س`;
    } else if (minutes > 0) {
      return `${formatNumber(minutes)}د`;
    } else {
      return `${formatNumber(seconds)}ث`;
    }
  };

  // Top Row Stats
  const topRowStats = [
    {
      icon: Clock,
      label: 'مدت فعالیت',
      value: formatTime(stats.totalTime),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20', // Glassy background for items
      borderColor: 'border-blue-200/50 dark:border-blue-500/30',
    },
    {
      icon: Target,
      label: 'پیشرفت امروز',
      value: `${formatNumber(stats.todaysProgress)}%`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
      borderColor: 'border-green-200/50 dark:border-green-500/30',
    },
    {
      icon: Award,
      label: 'روز متوالی',
      value: formatNumber(stats.streak),
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-200/50 dark:border-amber-500/30',
    }
  ];

  // Activity Items for Bottom Row
  const activityItems = [
    {
      icon: BookOpen,
      label: 'ویدیو',
      completed: todaysActivity?.videoWatched || false,
    },
    {
      icon: Headphones,
      label: 'پادکست',
      completed: todaysActivity?.podcastListened || false,
    },
    {
      icon: Calendar,
      label: 'مقاله',
      completed: todaysActivity?.articleRead || false,
    },
    {
      icon: Zap,
      label: 'لغات',
      completed: todaysActivity?.wordsReviewed || false,
    }
  ];

  return (
    <div className={`
      relative
      bg-white/60
      dark:bg-gray-900/60
      backdrop-blur-md
      border border-white/40
      dark:border-white/10
      rounded-2xl
      shadow-lg
      shadow-gray-200/50
      dark:shadow-black/20
      p-3
      flex flex-col gap-2.5
      transition-all duration-300
      hover:bg-white/70 dark:hover:bg-gray-900/70
      ${className}
    `}>
      {/* Header with Date on the right */}
      <div className="flex justify-between items-center pb-1.5 border-b border-gray-200/50 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
            آمار 
          </span>
        </div>
        
        {/* Date styling adjusted for glass theme */}
        <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-white/40 dark:bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/20 dark:border-white/5">
          {currentDate}
        </div>
      </div>

      {/* Row 1: Time, Today, Streak */}
      <div className="grid grid-cols-3 gap-2">
        {topRowStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className={`
                flex flex-col items-center justify-center
                p-2 rounded-xl border backdrop-blur-sm
                ${stat.bgColor} ${stat.borderColor}
                transition-colors duration-200
              `}
            >
              <div className="flex items-center gap-1 mb-0.5">
                <Icon className="w-3.5 h-3.5 text-current opacity-70" />
                <span className={`text-sm font-bold ${stat.color}`}>
                  {isLoading ? '-' : stat.value}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Row 2: Activities Only (Grid of 4) */}
      <div className="grid grid-cols-4 gap-2">
        {activityItems.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div 
              key={index}
              className={`
                flex flex-col items-center justify-center
                p-2 rounded-xl border backdrop-blur-sm transition-colors duration-200
                ${activity.completed 
                  ? 'bg-green-500/10 border-green-500/30 dark:bg-green-500/20 dark:border-green-400/30' 
                  : 'bg-gray-500/5 border-gray-200/40 dark:bg-white/5 dark:border-white/10'
                }
              `}
            >
              <div className="relative mb-1">
                <Icon className={`w-4 h-4 ${activity.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                {activity.completed && (
                  <CheckCircle className="w-2.5 h-2.5 text-green-600 absolute -top-1 -right-1 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full" />
                )}
              </div>
              <span className="text-[9px] text-gray-500 dark:text-gray-400">
                {activity.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}