// app/videos-by-level/[level]/page.tsx
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import { ArrowRight, Play, Clock, Users, Star, ChevronLeft, ChevronDown } from 'lucide-react';

const prisma = new PrismaClient();

async function getVideosByLevel(level: string) {
  const videos = await prisma.video.findMany({
    where: { level: level as any },
    orderBy: { createdAt: 'desc' },
  });
  return videos;
}

function getLevelInfo(level: string) {
  const levels = {
    'A1': { 
      title: 'مبتدی', 
      color: 'from-green-500 to-emerald-600', 
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      description: 'شروع یادگیری انگلیسی' 
    },
    'A2': { 
      title: 'مقدماتی', 
      color: 'from-blue-500 to-cyan-600', 
      bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      description: 'مکالمات ساده روزمره' 
    },
    'B1': { 
      title: 'متوسط', 
      color: 'from-purple-500 to-violet-600', 
      bgColor: 'bg-gradient-to-r from-purple-500 to-violet-600',
      description: 'مکالمات پیشرفته‌تر' 
    },
    'B2': { 
      title: 'بالاتر از متوسط', 
      color: 'from-orange-500 to-amber-600', 
      bgColor: 'bg-gradient-to-r from-orange-500 to-amber-600',
      description: 'مهارت‌های ارتباطی قوی' 
    },
    'C1': { 
      title: 'پیشرفته', 
      color: 'from-red-500 to-pink-600', 
      bgColor: 'bg-gradient-to-r from-red-500 to-pink-600',
      description: 'سطح حرفه‌ای' 
    },
    'C2': { 
      title: 'مسلط', 
      color: 'from-gray-500 to-slate-600', 
      bgColor: 'bg-gradient-to-r from-gray-500 to-slate-600',
      description: 'سطح native' 
    }
  };
  return levels[level as keyof typeof levels] || { 
    title: level, 
    color: 'from-gray-500 to-slate-600', 
    bgColor: 'bg-gradient-to-r from-gray-500 to-slate-600',
    description: 'ویدیوهای آموزشی' 
  };
}

export default async function LevelVideosPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const videos = await getVideosByLevel(level);
  const levelInfo = getLevelInfo(level);

  const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      <div className={`absolute top-1/4 -left-10 w-72 h-72 ${levelInfo.color.replace('from-', 'bg-').replace(' to-', '/10')} rounded-full blur-3xl opacity-20`}></div>
      <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header و فیلتر سطح */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Link 
                href="/video-levels"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3"
              >
                بازگشت
                <ChevronLeft className="h-4 w-4" />

              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ویدیوهای سطح {level}
              </h1>
 
            </div>
            

          </div>

          {/* فیلتر سطوح - شبیه Airbnb */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                {allLevels.map((lvl) => (
                  <Link
                    key={lvl}
                    href={`/videos-by-level/${lvl}`}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex-shrink-0 ${
                      lvl === level 
                        ? `${levelInfo.bgColor} text-white shadow-md` 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {lvl}
                  </Link>
                ))}
              </div>
              

            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link key={video.id} href={`/video/${video.id}`} className="group block">
                <div className="relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg dark:group-hover:shadow-gray-800/50 group-hover:border-gray-400 dark:group-hover:border-gray-600 h-full">
                  
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    {video.thumbnailUrl ? (
                      <Image 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <Play className="h-12 w-12 text-gray-500 dark:text-gray-400 group-hover:text-white/70 transition-colors" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 dark:bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className={`absolute top-3 right-3 ${levelInfo.bgColor} text-white px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm`}>
                      {video.level}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {video.title}
                    </h3>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{Math.floor(Math.random() * 100) + 50}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>۴.۸</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>۱۵:۳۰</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
            <div className="text-gray-400 text-8xl mb-6">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">ویدیویی یافت نشد</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              در حال حاضر ویدیویی برای این سطح موجود نیست
            </p>
            <Link 
              href="/video-levels"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-105 font-semibold"
            >
              <ArrowRight className="h-5 w-5" />
              بازگشت به سطوح
            </Link>
          </div>
        )}

        {/* Back to Levels */}
        <div className="mt-12 mb-14 text-center">
          <Link 
            href="/video-levels"
            className="inline-flex items-center gap-3 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-6 py-3 rounded-xl transition-all duration-300 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 font-medium"
          >
            <ArrowRight className="h-5 w-5" />
            مشاهده همه سطوح
          </Link>
        </div>
      </div>
    </div>
  );
}