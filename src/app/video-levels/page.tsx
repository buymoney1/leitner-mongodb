// app/video-levels/page.tsx
import Link from 'next/link';
import { Play, Star, Target, TrendingUp, Users, Clock } from 'lucide-react';

const videoLevels = [
  {
    level: 'A1',
    title: 'مبتدی',
    description: 'شروع یادگیری',
    color: 'from-green-500 to-emerald-600',
    iconColor: 'text-green-500 dark:text-green-400',
    bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    borderColor: 'border-green-500/20 dark:border-green-500/30',
    estimatedTime: '۱-۲ ماه',
    wordCount: '۵۰۰+ کلمه',
    learners: '۱۰۰۰+ زبان‌آموز'
  },
  {
    level: 'A2',
    title: 'مقدماتی',
    description: 'مکالمات ساده',
    color: 'from-blue-500 to-cyan-600',
    iconColor: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderColor: 'border-blue-500/20 dark:border-blue-500/30',
    estimatedTime: '۲-۳ ماه',
    wordCount: '۱۰۰۰+ کلمه',
    learners: '۸۰۰+ زبان‌آموز'
  },
  {
    level: 'B1',
    title: 'متوسط',
    description: 'مکالمات روزمره',
    color: 'from-purple-500 to-violet-600',
    iconColor: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderColor: 'border-purple-500/20 dark:border-purple-500/30',
    estimatedTime: '۳-۴ ماه',
    wordCount: '۲۰۰۰+ کلمه',
    learners: '۶۰۰+ زبان‌آموز'
  },
  {
    level: 'B2',
    title: 'بالاتر از متوسط',
    description: 'مکالمات پیشرفته',
    color: 'from-orange-500 to-amber-600',
    iconColor: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    borderColor: 'border-orange-500/20 dark:border-orange-500/30',
    estimatedTime: '۴-۶ ماه',
    wordCount: '۴۰۰۰+ کلمه',
    learners: '۴۰۰+ زبان‌آموز'
  },
  {
    level: 'C1',
    title: 'پیشرفته',
    description: 'مهارت حرفه‌ای',
    color: 'from-red-500 to-pink-600',
    iconColor: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-500/10 dark:bg-red-500/20',
    borderColor: 'border-red-500/20 dark:border-red-500/30',
    estimatedTime: '۶-۸ ماه',
    wordCount: '۸۰۰۰+ کلمه',
    learners: '۲۰۰+ زبان‌آموز'
  },
  {
    level: 'C2',
    title: 'مسلط',
    description: 'سطح native',
    color: 'from-gray-500 to-slate-600',
    iconColor: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-500/10 dark:bg-gray-500/20',
    borderColor: 'border-gray-500/20 dark:border-gray-500/30',
    estimatedTime: '۸+ ماه',
    wordCount: '۱۶۰۰۰+ کلمه',
    learners: '۱۰۰+ زبان‌آموز'
  }
];

export default function VideoLevelsPage() {
  return (
    <div className="overflow-x-hidden"> 
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 relative">

        {/* Grid background */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] pointer-events-none"></div>

        {/* Left Glow */}
        <div className="absolute top-1/4 left-0 -translate-x-1/2 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Right Glow */}
        <div className="absolute bottom-1/4 right-0 translate-x-1/2 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto">


          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">6</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">سطح مختلف</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">100+</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">ویدیو آموزشی</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">1000+</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">زبان‌آموز فعال</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">95%</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">رضایت‌مندی</div>
            </div>
          </div>

          {/* Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoLevels.map((level) => (
              <Link key={level.level} href={`/videos-by-level/${level.level}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl p-6 transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl dark:group-hover:shadow-2xl h-full">

                  {/* Hover border glow (fixed inset) */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl scale-110`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${level.color} shadow-lg`}>
                          <Target className={`h-6 w-6 ${level.iconColor}`} />
                        </div>
                        <div>
                          <div className={`text-2xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                            {level.level}
                          </div>
                          <div className="text-gray-900 dark:text-white font-semibold text-lg">{level.title}</div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${level.color} mt-2`}></div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{level.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>مدت زمان: {level.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Star className="h-4 w-4" />
                        <span>دایره لغات: {level.wordCount}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{level.learners}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">شروع یادگیری</span>
                        <div className={`p-2 rounded-lg ${level.bgColor} border ${level.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                          <Play className={`h-4 w-4 ${level.iconColor}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-16 mb-20 text-center">
            <div className="bg-white dark:bg-gray-800/50 bg-gradient-to-r from-gray-50 to-white/60 dark:from-gray-800/50 dark:to-gray-900/30 rounded-2xl p-8 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                مطمئن نیستید کدام سطح مناسب شماست؟
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-2xl mx-auto">
                آزمون تعیین سطح رایگان ما به شما کمک می‌کند تا دقیقاً بدانید از کجا باید شروع کنید
              </p>
              <button
                disabled
                className="text-sm disabled:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-xl transition-all duration-300 shadow-lg font-semibold"
              >
                <TrendingUp className="h-5 w-5" />
                تعیین سطح
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}