// components/planner/JourneyProgress.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Lock,
  Loader2,
  Map,
  Star,
  Award,
  Mountain,
  Compass,
  Sparkles,
  Zap,
  Target
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
  perfectDaysRequired: number;
  perfectDaysCompleted: number;
  reward: string;
}

export default function JourneyProgress({ 
  showAllLevels = false,
  className = ''
}: JourneyProgressProps) {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [userPerfectDays, setUserPerfectDays] = useState<number>(0);
  const [userLevels, setUserLevels] = useState<UserLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تنظیمات سطح‌ها - بی‌نهایت لول
  const getLevelConfig = (levelNumber: number) => {
    // الگوهای تکراری برای لول‌های بالا
    const patternIndex = (levelNumber - 1) % 15;
    
    const patterns = [
      { 
        name: 'شروع ماجراجویی', 
        description: 'اولین روزهای کامل یادگیری', 
        color: 'from-blue-400 to-cyan-500',
        gradient: 'bg-gradient-to-r from-blue-400 to-cyan-500',
        icon: Compass,
        reward: 'آشنایی با سیستم'
      },
      { 
        name: 'مسافر تازه‌کار', 
        description: 'دریافت اولین دستاوردها', 
        color: 'from-emerald-400 to-green-500',
        gradient: 'bg-gradient-to-r from-emerald-400 to-green-500',
        icon: Star,
        reward: 'آیکون مسافر'
      },
      { 
        name: 'کاشف کلمات', 
        description: 'ساخت دایره لغات', 
        color: 'from-purple-400 to-violet-500',
        gradient: 'bg-gradient-to-r from-purple-400 to-violet-500',
        icon: Mountain,
        reward: 'دسترسی به دیکشنری ویژه'
      },
      { 
        name: 'گوینده محلی', 
        description: 'تسلط بر مکالمات ساده', 
        color: 'from-amber-400 to-orange-500',
        gradient: 'bg-gradient-to-r from-amber-400 to-orange-500',
        icon: Award,
        reward: 'گواهینامه مکالمه'
      },
      { 
        name: 'داستان‌گزار', 
        description: 'فهم محتوای پیچیده', 
        color: 'from-rose-400 to-pink-500',
        gradient: 'bg-gradient-to-r from-rose-400 to-pink-500',
        icon: Sparkles,
        reward: 'کتاب داستان ویژه'
      },
      { 
        name: 'فیلسوف زبان', 
        description: 'درک مفاهیم انتزاعی', 
        color: 'from-indigo-400 to-blue-500',
        gradient: 'bg-gradient-to-r from-indigo-400 to-blue-500',
        icon: Compass,
        reward: 'دسترسی به فلسفه زبان'
      },
      { 
        name: 'شاعر کلمات', 
        description: 'کاربرد هنری زبان', 
        color: 'from-fuchsia-400 to-purple-500',
        gradient: 'bg-gradient-to-r from-fuchsia-400 to-purple-500',
        icon: Star,
        reward: 'دفتر شعر دیجیتال'
      },
      { 
        name: 'دیپلمات فرهنگی', 
        description: 'فهم عمیق فرهنگ', 
        color: 'from-teal-400 to-emerald-500',
        gradient: 'bg-gradient-to-r from-teal-400 to-emerald-500',
        icon: Award,
        reward: 'گواهینامه بین‌المللی'
      },
      { 
        name: 'استاد سخنوری', 
        description: 'تسلط کامل بر بیان', 
        color: 'from-cyan-400 to-blue-500',
        gradient: 'bg-gradient-to-r from-cyan-400 to-blue-500',
        icon: Target,
        reward: 'دسترسی به سخنرانی‌ها'
      },
      { 
        name: 'افسانه زبان', 
        description: 'تبدیل شدن به افسانه', 
        color: 'from-gold-400 to-yellow-500',
        gradient: 'bg-gradient-to-r from-gold-400 to-yellow-500',
        icon: Mountain,
        reward: 'تاج افسانه'
      },
      { 
        name: 'نگهبان دانش', 
        description: 'نگهبانی از زبان', 
        color: 'from-slate-400 to-gray-500',
        gradient: 'bg-gradient-to-r from-slate-400 to-gray-500',
        icon: Compass,
        reward: 'نگهبان رسمی'
      },
      { 
        name: 'معمار کلمات', 
        description: 'ساختارهای جدید', 
        color: 'from-amber-500 to-orange-600',
        gradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
        icon: Zap,
        reward: 'معماری زبان'
      },
      { 
        name: 'جادوگر سخن', 
        description: 'جادوی ارتباط', 
        color: 'from-purple-500 to-indigo-600',
        gradient: 'bg-gradient-to-r from-purple-500 to-indigo-600',
        icon: Sparkles,
        reward: 'کتاب جادو'
      },
      { 
        name: 'پیامبر زبان', 
        description: 'پیش‌بینی تحولات', 
        color: 'from-blue-500 to-cyan-600',
        gradient: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        icon: Compass,
        reward: 'بینش آینده'
      },
      { 
        name: 'خالق جهان', 
        description: 'خلق زبان جدید', 
        color: 'from-red-500 to-pink-600',
        gradient: 'bg-gradient-to-r from-red-500 to-pink-600',
        icon: Map,
        reward: 'سیاره مخصوص'
      }
    ];

    const pattern = patterns[patternIndex];
    
    // اضافه کردن شماره لول به نام برای لول‌های بالا
    const levelName = levelNumber > 15 ? 
      `${pattern.name} ${Math.ceil(levelNumber / 15)}` : 
      pattern.name;
    
    return {
      id: `level-${levelNumber}`,
      level: levelNumber,
      name: levelName,
      description: pattern.description,
      color: pattern.color,
      gradient: pattern.gradient,
      icon: pattern.icon,
      reward: levelNumber > 15 ? `${pattern.reward} ${Math.ceil(levelNumber / 15)}` : pattern.reward
    };
  };

  // تابع برای فرمت اعداد فارسی
  const formatNumber = (num: number) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
  };

  // تابع برای محاسبه درصد پیشرفت
  const calculateProgress = (perfectDaysCompleted: number, perfectDaysRequired: number) => {
    if (perfectDaysRequired === 0) return 0;
    return Math.min(100, Math.round((perfectDaysCompleted / perfectDaysRequired) * 100));
  };

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      setIsLoading(true);
      
      // API برای دریافت perfectDays کاربر
      const response = await fetch('/api/planner/user-level');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const perfectDays = data.data.perfectDays || 0;
          const currentLevel = perfectDays + 1; // هر perfectDay = 1 لول
          
          setUserPerfectDays(perfectDays);
          setCurrentLevel(currentLevel);
          
          // محاسبه سطح‌ها بر اساس perfectDays کاربر
          const startLevel = Math.max(1, perfectDays > 0 ? perfectDays - 4 : 1); // 5 لول قبل از لول فعلی
          const endLevel = startLevel + 9; // نمایش 10 لول
          
          const levels = [];
          
          for (let levelNumber = startLevel; levelNumber <= endLevel; levelNumber++) {
            const config = getLevelConfig(levelNumber);
            const unlocked = levelNumber <= currentLevel;
            const completed = levelNumber < currentLevel;
            
            // محاسبه perfectDays برای این لول
            const perfectDaysRequired = 1; // هر لول نیاز به 1 perfectDay دارد
            
            let perfectDaysCompleted = 0;
            if (completed) {
              perfectDaysCompleted = perfectDaysRequired; // لول کامل شده
            } else if (unlocked && levelNumber === currentLevel) {
              // لول فعلی - پیشرفت بر اساس perfectDays باقی‌مانده
              perfectDaysCompleted = perfectDays % perfectDaysRequired;
            }
            
            levels.push({
              ...config,
              unlocked,
              completed,
              perfectDaysRequired,
              perfectDaysCompleted
            });
          }
          
          setUserLevels(levels);
        }
      }
    } catch (error) {
      console.error('Error fetching user level:', error);
      
      // حالت نمایشی برای تست
      const mockPerfectDays = 50;
      const mockCurrentLevel = mockPerfectDays + 1;
      
      setUserPerfectDays(mockPerfectDays);
      setCurrentLevel(mockCurrentLevel);
      
      const mockLevels = [];
      const startLevel = Math.max(1, mockPerfectDays - 4);
      const endLevel = startLevel + 9;
      
      for (let levelNumber = startLevel; levelNumber <= endLevel; levelNumber++) {
        const config = getLevelConfig(levelNumber);
        const unlocked = levelNumber <= mockCurrentLevel;
        const completed = levelNumber < mockCurrentLevel;
        
        mockLevels.push({
          ...config,
          unlocked,
          completed,
          perfectDaysRequired: 1,
          perfectDaysCompleted: completed ? 1 : 
                              (unlocked && levelNumber === mockCurrentLevel ? mockPerfectDays % 1 : 0)
        });
      }
      
      setUserLevels(mockLevels);
    } finally {
      setIsLoading(false);
    }
  };

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
      bg-white dark:bg-gray-800
      border-gray-200 dark:border-gray-700
      ${className}
    `}>
      {/* هدر */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700">
            <Map className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              سفر یادگیری شما
            </h2>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
              لول {formatNumber(currentLevel)} • {formatNumber(userPerfectDays)} روز کامل
            </p>
          </div>
        </div>
        
        {isLoading && (
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        )}
      </div>

      {/* پیشرفت کلی */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            روزهای کامل یادگیری
          </span>
          <span className="text-sm font-bold text-gray-800 dark:text-white">
            {formatNumber(userPerfectDays)} روز
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${userPerfectDays > 100 ? 100 : userPerfectDays}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            لول فعلی: {formatNumber(currentLevel)}
          </span>
          <span className="text-gray-600 dark:text-gray-300">
            {formatNumber(userLevels.filter(l => l.completed).length)} از {formatNumber(userLevels.length)} مرحله
          </span>
        </div>
      </div>

      {/* لیست لول‌ها */}
      <div className="space-y-4">
        {userLevels.map((level) => {
          const Icon = level.icon;
          const progress = calculateProgress(level.perfectDaysCompleted, level.perfectDaysRequired);
          
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
                ${level.unlocked ? 'bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-80'}
                ${level.unlocked ? 'border-opacity-30' : 'border-opacity-20'}
                ${level.completed ? 'ring-2 ring-opacity-30 ring-green-500' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2
                    rounded-lg
                    transition-all
                    duration-300
                    ${level.unlocked ? level.gradient : 'bg-gray-200 dark:bg-gray-800'}
                    ${!level.unlocked ? 'opacity-50' : ''}
                  `}>
                    <Icon className={`w-4 h-4 ${level.unlocked ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`text-sm font-bold ${level.unlocked ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                        لول {formatNumber(level.level)}: {level.name}
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
                    'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }
                `}>
                  روز {formatNumber(level.perfectDaysRequired)}
                </div>
              </div>

              {/* نوار پیشرفت */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className={level.unlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}>
                    {formatNumber(level.perfectDaysCompleted)}/{formatNumber(level.perfectDaysRequired)} روز کامل
                  </span>
                  <span className={`font-medium ${level.unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                    {level.completed ? '۱۰۰%' : `${formatNumber(progress)}%`}
                  </span>
                </div>
                
                <div className={`
                  w-full
                  h-1.5
                  rounded-full
                  overflow-hidden
                  transition-colors
                  duration-300
                  ${level.unlocked ? 'bg-gray-200 dark:bg-gray-800' : 'bg-gray-300 dark:bg-gray-900'}
                `}>
                  {level.unlocked && (
                    <div 
                      className={`h-full rounded-full ${level.gradient} transition-all duration-500`}
                      style={{ width: `${level.completed ? 100 : progress}%` }}
                    ></div>
                  )}
                </div>
              </div>
              

            </div>
          );
        })}
      </div>

      {/* نکات پایانی */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-gray-600 dark:text-gray-300">
            هر روز کامل (100% فعالیت‌ها) = 1 لول جدید • سیستم بی‌نهایت لول
          </span>
        </div>
      </div>
    </div>
  );
}