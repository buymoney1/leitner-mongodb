// app/all-videos/page.tsx
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import { 
  ArrowRight, 
  Play, 
  Clock, 
  Users, 
  Star, 
  ChevronLeft,
  Filter,
  Grid,
  List
} from 'lucide-react';

const prisma = new PrismaClient();

async function getAllVideos() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      vocabularies: {
        select: {
          id: true,
          word: true
        }
      }
    }
  });
  return videos;
}

export default async function AllVideosPage() {
  const videos = await getAllVideos();

  // گروه‌بندی ویدیوها بر اساس سطح
  const videosByLevel = videos.reduce((acc, video) => {
    if (!acc[video.level]) {
      acc[video.level] = [];
    }
    acc[video.level].push(video);
    return acc;
  }, {} as Record<string, typeof videos>);

  const levels = Object.keys(videosByLevel).sort();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* هدر */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link 
                href="/video-levels"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-3"
              >
                <ChevronLeft className="h-4 w-4" />
                بازگشت
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                همه ویدیوهای آموزشی
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                مجموعه کامل ویدیوهای آموزشی بر اساس سطح
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                {videos.length} ویدیو
              </span>
            </div>
          </div>
        </div>

        {/* نمایش ویدیوها بر اساس سطح */}
        {levels.length > 0 ? (
          <div className="space-y-12">
            {levels.map((level) => (
              <div key={level} className="border border-gray-200 dark:border-gray-700/50 rounded-2xl p-6 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
                {/* هدر سطح */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-8 rounded-full bg-gradient-to-b ${
                      level === 'A1' ? 'from-green-500 to-emerald-600' :
                      level === 'A2' ? 'from-blue-500 to-cyan-600' :
                      level === 'B1' ? 'from-purple-500 to-violet-600' :
                      level === 'B2' ? 'from-orange-500 to-amber-600' :
                      level === 'C1' ? 'from-red-500 to-pink-600' :
                      'from-gray-500 to-slate-600'
                    }`}></div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        سطح {level}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {videosByLevel[level].length} ویدیو
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/videos-by-level/${level}`}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    مشاهده همه
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Grid ویدیوها */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videosByLevel[level].slice(0, 3).map((video) => (
                    <Link key={video.id} href={`/video/${video.id}`} className="group block">
                      <div className="relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg dark:group-hover:shadow-gray-800/50 group-hover:border-gray-400 dark:group-hover:border-gray-600">
                        
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
                          
                          {/* Level Badge */}
                          <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm text-white ${
                            level === 'A1' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            level === 'A2' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                            level === 'B1' ? 'bg-gradient-to-r from-purple-500 to-violet-600' :
                            level === 'B2' ? 'bg-gradient-to-r from-orange-500 to-amber-600' :
                            level === 'C1' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                            'bg-gradient-to-r from-gray-500 to-slate-600'
                          }`}>
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
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{Math.floor(Math.random() * 100) + 50}</span>
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

                {/* دکمه مشاهده بیشتر */}
                {videosByLevel[level].length > 3 && (
                  <div className="mt-6 text-center">
                    <Link 
                      href={`/videos-by-level/${level}`}
                      className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
                    >
                      مشاهده {videosByLevel[level].length - 3} ویدیوی دیگر
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
            <div className="text-gray-400 text-8xl mb-6">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">ویدیویی یافت نشد</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              در حال حاضر ویدیویی در سیستم وجود ندارد
            </p>
          </div>
        )}
      </div>
    </div>
  );
}