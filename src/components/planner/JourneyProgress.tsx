// components/planner/JourneyProgress.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  Mountain, 
  Compass, 
  Star, 
  Zap, 
  Target, 
  CheckCircle, 
  Lock,
  Loader2,
  Sparkles,
  Map,
  Moon,
  Sun
} from 'lucide-react';

interface JourneyProgressProps {
  showAllLevels?: boolean;
  className?: string;
}

interface UserLevel {
  id: string;
  level: number;
  name: string;
  description: string;
  color: string;
  gradient: string;
  icon: any;
  unlocked: boolean;
  completed: boolean;
  tasksRequired: number;
  tasksCompleted: number;
  reward: string;
}

export default function JourneyProgress({ 
  showAllLevels = false,
  className = ''
}: JourneyProgressProps) {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [userLevels, setUserLevels] = useState<UserLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTasks, setTotalTasks] = useState<{ required: number; completed: number }>({
    required: 0,
    completed: 0
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // تشخیص خودکار حالت تاریک
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // کلاس‌های داینامیک بر اساس حالت تاریک
  const getThemeClasses = () => {
    if (isDarkMode) {
      return {
        container: 'bg-gray-800 border-gray-700 text-white',
        card: 'bg-gray-700/50 border-gray-600',
        cardLocked: 'bg-gray-900/50 border-gray-800 opacity-80',
        textPrimary: 'text-gray-100',
        textSecondary: 'text-gray-300',
        textTertiary: 'text-gray-400',
        bgGray: 'bg-gray-700',
        bgGrayLight: 'bg-gray-800',
        bgGrayLighter: 'bg-gray-900',
        borderLight: 'border-gray-700',
        successText: 'text-green-400',
        infoText: 'text-blue-400',
        warningText: 'text-yellow-400',
        accentText: 'text-amber-400',
        progressBarBg: 'bg-gray-800',
        cardCompleted: 'ring-2 ring-opacity-30 ring-green-500'
      };
    } else {
      return {
        container: 'bg-gradient-to-br from-white to-gray-50 border-gray-200 text-gray-800',
        card: 'bg-white border-gray-300',
        cardLocked: 'bg-gray-50 border-gray-200 opacity-80',
        textPrimary: 'text-gray-800',
        textSecondary: 'text-gray-600',
        textTertiary: 'text-gray-500',
        bgGray: 'bg-gray-100',
        bgGrayLight: 'bg-gray-200',
        bgGrayLighter: 'bg-gray-300',
        borderLight: 'border-gray-200',
        successText: 'text-green-600',
        infoText: 'text-blue-600',
        warningText: 'text-amber-600',
        accentText: 'text-amber-600',
        progressBarBg: 'bg-gray-200',
        cardCompleted: 'ring-2 ring-opacity-30 ring-green-500'
      };
    }
  };

  const theme = getThemeClasses();

  // تنظیمات سطح‌ها - تعداد فعالیت مورد نیاز برای هر سطح تغییر کرد
  const levelConfigs = [
    { 
      id: '1', 
      name: 'شروع ماجراجویی', 
      description: 'اولین گام‌های یادگیری', 
      color: 'from-blue-400 to-cyan-500',
      gradient: 'bg-gradient-to-r from-blue-400 to-cyan-500',
      icon: Compass,
      tasksRequired: 4, // تغییر از 5 به 4
      reward: 'آشنایی با سیستم'
    },
    { 
      id: '2', 
      name: 'مسافر تازه‌کار', 
      description: 'دریافت اولین دستاوردها', 
      color: 'from-emerald-400 to-green-500',
      gradient: 'bg-gradient-to-r from-emerald-400 to-green-500',
      icon: Star,
      tasksRequired: 8, // تغییر از 10 به 8
      reward: 'آیکون مسافر'
    },
    { 
      id: '3', 
      name: 'کاشف کلمات', 
      description: 'ساخت دایره لغات', 
      color: 'from-purple-400 to-violet-500',
      gradient: 'bg-gradient-to-r from-purple-400 to-violet-500',
      icon: Mountain,
      tasksRequired: 16, // تغییر از 20 به 16
      reward: 'دسترسی به دیکشنری ویژه'
    },
    { 
      id: '4', 
      name: 'گوینده محلی', 
      description: 'تسلط بر مکالمات ساده', 
      color: 'from-amber-400 to-orange-500',
      gradient: 'bg-gradient-to-r from-amber-400 to-orange-500',
      icon: Award,
      tasksRequired: 24, // تغییر از 30 به 24
      reward: 'گواهینامه مکالمه'
    },
    { 
      id: '5', 
      name: 'داستان‌گزار', 
      description: 'فهم محتوای پیچیده', 
      color: 'from-rose-400 to-pink-500',
      gradient: 'bg-gradient-to-r from-rose-400 to-pink-500',
      icon: Sparkles,
      tasksRequired: 32, // تغییر از 40 به 32
      reward: 'کتاب داستان ویژه'
    },
    { 
      id: '6', 
      name: 'فیلسوف زبان', 
      description: 'درک مفاهیم انتزاعی', 
      color: 'from-indigo-400 to-blue-500',
      gradient: 'bg-gradient-to-r from-indigo-400 to-blue-500',
      icon: TrendingUp,
      tasksRequired: 40, // تغییر از 50 به 40
      reward: 'دسترسی به فلسفه زبان'
    },
    { 
      id: '7', 
      name: 'شاعر کلمات', 
      description: 'کاربرد هنری زبان', 
      color: 'from-fuchsia-400 to-purple-500',
      gradient: 'bg-gradient-to-r from-fuchsia-400 to-purple-500',
      icon: Star,
      tasksRequired: 48, // تغییر از 60 به 48
      reward: 'دفتر شعر دیجیتال'
    },
    { 
      id: '8', 
      name: 'دیپلمات فرهنگی', 
      description: 'فهم عمیق فرهنگ', 
      color: 'from-teal-400 to-emerald-500',
      gradient: 'bg-gradient-to-r from-teal-400 to-emerald-500',
      icon: Award,
      tasksRequired: 56, // تغییر از 70 به 56
      reward: 'گواهینامه بین‌المللی'
    },
    { 
      id: '9', 
      name: 'استاد سخنوری', 
      description: 'تسلط کامل بر بیان', 
      color: 'from-cyan-400 to-blue-500',
      gradient: 'bg-gradient-to-r from-cyan-400 to-blue-500',
      icon: Target,
      tasksRequired: 64, // تغییر از 80 به 64
      reward: 'دسترسی به سخنرانی‌ها'
    },
    { 
      id: '10', 
      name: 'افسانه زبان', 
      description: 'تبدیل شدن به افسانه', 
      color: 'from-gold-400 to-yellow-500',
      gradient: 'bg-gradient-to-r from-gold-400 to-yellow-500',
      icon: Mountain,
      tasksRequired: 72, // تغییر از 90 به 72
      reward: 'تاج افسانه'
    },
    { 
      id: '11', 
      name: 'نگهبان دانش', 
      description: 'نگهبانی از زبان', 
      color: 'from-slate-400 to-gray-500',
      gradient: 'bg-gradient-to-r from-slate-400 to-gray-500',
      icon: Lock,
      tasksRequired: 80, // تغییر از 100 به 80
      reward: 'نگهبان رسمی'
    },
    { 
      id: '12', 
      name: 'معمار کلمات', 
      description: 'ساختارهای جدید', 
      color: 'from-amber-500 to-orange-600',
      gradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
      icon: Zap,
      tasksRequired: 88, // تغییر از 110 به 88
      reward: 'معماری زبان'
    },
    { 
      id: '13', 
      name: 'جادوگر سخن', 
      description: 'جادوی ارتباط', 
      color: 'from-purple-500 to-indigo-600',
      gradient: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      icon: Sparkles,
      tasksRequired: 96, // تغییر از 120 به 96
      reward: 'کتاب جادو'
    },
    { 
      id: '14', 
      name: 'پیامبر زبان', 
      description: 'پیش‌بینی تحولات', 
      color: 'from-blue-500 to-cyan-600',
      gradient: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      icon: Compass,
      tasksRequired: 104, // تغییر از 130 به 104
      reward: 'بینش آینده'
    },
    { 
      id: '15', 
      name: 'خالق جهان', 
      description: 'خلق زبان جدید', 
      color: 'from-red-500 to-pink-600',
      gradient: 'bg-gradient-to-r from-red-500 to-pink-600',
      icon: Map,
      tasksRequired: 112, // تغییر از 140 به 112
      reward: 'سیاره مخصوص'
    }
  ];

  // تابع برای فرمت اعداد فارسی
  const formatNumber = (num: number) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
  };

  // تابع برای محاسبه درصد پیشرفت
  const calculateProgress = (tasksCompleted: number, tasksRequired: number) => {
    if (tasksRequired === 0) return 0;
    return Math.min(100, Math.round((tasksCompleted / tasksRequired) * 100));
  };

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      setIsLoading(true);
      
      // API جدید برای دریافت سطح فعلی کاربر
      const response = await fetch('/api/planner/user-level');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const userLevel = data.data.currentLevel || 1;
          const tasksCompleted = data.data.tasksCompleted || 0;
          
          setCurrentLevel(userLevel);
          
          // محاسبه سطح‌ها بر اساس سطح فعلی کاربر
          const startLevel = userLevel;
          const endLevel = showAllLevels ? levelConfigs.length : Math.min(startLevel + 9, levelConfigs.length);
          
          const levels = levelConfigs.slice(startLevel - 1, endLevel).map((config, index) => {
            const levelNumber = startLevel + index;
            const tasksRequired = config.tasksRequired;
            
            // اگر سطح فعلی است، tasksCompleted را از API می‌گیریم
            const currentTasksCompleted = levelNumber === userLevel ? 
              tasksCompleted : 
              (levelNumber < userLevel ? tasksRequired : 0);
            
            return {
              ...config,
              level: levelNumber,
              unlocked: levelNumber <= userLevel,
              completed: levelNumber < userLevel,
              tasksCompleted: currentTasksCompleted,
              tasksRequired
            };
          });
          
          setUserLevels(levels);
          
          // محاسبه کل تسک‌ها
          const totalRequired = levels.reduce((sum, level) => sum + level.tasksRequired, 0);
          const totalCompleted = levels.reduce((sum, level) => sum + level.tasksCompleted, 0);
          
          setTotalTasks({ required: totalRequired, completed: totalCompleted });
        }
      }
    } catch (error) {
      console.error('Error fetching user level:', error);
      
      // حالت نمایشی برای تست
      const mockLevels = levelConfigs.slice(0, 10).map((config, index) => ({
        ...config,
        level: index + 1,
        unlocked: index < 5,
        completed: index < 4,
        tasksCompleted: index < 4 ? config.tasksRequired : Math.floor(Math.random() * config.tasksRequired),
        tasksRequired: config.tasksRequired
      }));
      
      setUserLevels(mockLevels);
      setCurrentLevel(5);
    } finally {
      setIsLoading(false);
    }
  };

  // محاسبه درصد کلی پیشرفت
  const overallProgress = totalTasks.required > 0 ? 
    Math.round((totalTasks.completed / totalTasks.required) * 100) : 0;

  return (
    <div className={`
      rounded-2xl
      shadow-lg
      p-6
    
      mb-10
      border
      transition-all
      duration-300
      hover:shadow-xl
      ${theme.container}
      ${className}
    `}>
      {/* هدر با دکمه تغییر تم */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className={`
            p-2
            rounded-xl
            ${theme.bgGray}
            transition-colors
            duration-300
          `}>
            <Map className={`w-5 h-5 ${theme.accentText}`} />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${theme.textPrimary}`}>
              سفر یادگیری شما
            </h2>
            <p className={`text-sm mt-1 ${theme.textSecondary}`}>
              از سطح {formatNumber(currentLevel)} به سمت قله‌های دانش
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          )}
        </div>
      </div>

      {/* پیشرفت کلی */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm font-medium ${theme.textSecondary}`}>
            پیشرفت کلی ماجراجویی
          </span>
          <span className={`text-sm font-bold ${theme.textPrimary}`}>
            {formatNumber(overallProgress)}%
          </span>
        </div>
        <div className={`
          h-2
          rounded-full
          ${theme.progressBarBg}
          overflow-hidden
          transition-colors
          duration-300
        `}>
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className={theme.textTertiary}>
            {formatNumber(totalTasks.completed)} از {formatNumber(totalTasks.required)} تسک
          </span>
          <span className={theme.textSecondary}>
            {formatNumber(userLevels.filter(l => l.completed).length)} از {formatNumber(userLevels.length)} مرحله
          </span>
        </div>
      </div>

      {/* لیست لول‌ها */}
      <div className="space-y-4">
        {userLevels.map((level) => {
          const Icon = level.icon;
          const progress = calculateProgress(level.tasksCompleted, level.tasksRequired);
          
          return (
            <div 
              key={level.id}
              className={`
                p-4
                rounded-xl
                border
                transition-all
                duration-300
                hover:scale-[1.02]
                ${level.unlocked ? theme.card : theme.cardLocked}
                ${level.unlocked ? 'border-opacity-30' : 'border-opacity-20'}
                ${level.completed ? theme.cardCompleted : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2
                    rounded-lg
                    transition-all
                    duration-300
                    ${level.unlocked ? level.gradient : theme.bgGrayLight}
                    ${!level.unlocked ? 'opacity-50' : ''}
                  `}>
                    <Icon className={`w-4 h-4 ${level.unlocked ? 'text-white' : theme.textTertiary}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`text-sm font-bold ${level.unlocked ? theme.textPrimary : theme.textTertiary}`}>
                        مرحله {formatNumber(level.level)}: {level.name}
                      </div>
                      
                      {level.completed && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                      
                      {!level.unlocked && (
                        <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* نشانگر سطح */}
                <div className={`
                  px-2
                  py-1
                  rounded-lg
                  text-xs
                  font-bold
                  transition-colors
                  duration-300
                  flex-shrink-0
                  ml-2
                  ${level.completed ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 
                    level.unlocked ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 
                    isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'
                  }
                `}>
                  لول {formatNumber(level.level)}
                </div>
              </div>

              {/* نوار پیشرفت - به صورت جداگانه با عرض کامل */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className={level.unlocked ? theme.textTertiary : theme.textTertiary}>
                    {formatNumber(level.tasksCompleted)}/{formatNumber(level.tasksRequired)} فعالیت
                  </span>
                  <span className={`font-medium ${level.unlocked ? theme.textSecondary : theme.textTertiary}`}>
                    {formatNumber(progress)}%
                  </span>
                </div>
                
                <div className={`
                  w-full
                  h-1.5
                  rounded-full
                  overflow-hidden
                  transition-colors
                  duration-300
                  ${level.unlocked ? theme.bgGrayLight : theme.bgGrayLighter}
                `}>
                  {level.unlocked && (
                    <div 
                      className={`h-full rounded-full ${level.gradient} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* نکات پایانی */}
      <div className={`
        mt-6
        pt-4
        border-t
        ${theme.borderLight}
      `}>
        <div className="flex items-center gap-2 text-sm">
          <Zap className={`w-4 h-4 ${theme.accentText}`} />
          <span className={theme.textSecondary}>
            برای رفتن به لول بعدی، تمام فعالیت‌های روز جاری را تکمیل کنید
          </span>
        </div>
      </div>
    </div>
  );
}