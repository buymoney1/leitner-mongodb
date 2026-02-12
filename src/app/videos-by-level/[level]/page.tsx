// app/videos-by-level/[level]/page.tsx
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
  Edit,
  Tv,
  Film
} from 'lucide-react';

import DeleteVideoButton from '@/components/video/DeleteVideoButton';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../lib/server-auth';

async function getVideosByLevel(level: string) {
  const videos = await prisma.video.findMany({
    where: { 
      level: level as any,
      isPublished: true 
    },
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

function formatDuration(minutes: number | null): string {
  if (!minutes) return '--';
  if (minutes < 60) {
    return `${minutes} دقیقه`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} ساعت${mins > 0 ? ` و ${mins} دقیقه` : ''}`;
}

export default async function LevelVideosPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const videos = await getVideosByLevel(level);
  const levelInfo = getLevelInfo(level);
  const session = await getAuthSession();
  const isAdmin = session?.user?.role === 'admin';

  const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  // جدا کردن فیلم‌های تکی و سریال‌ها
  const singleVideos = videos.filter(v => !v.isSeries);
  const seriesVideos = videos.filter(v => v.isSeries);

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
                <ChevronLeft className="h-4 w-4" />
                بازگشت
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ویدیوهای سطح {level}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {levelInfo.description}
              </p>
            </div>

            {/* دکمه‌های آپلود برای ادمین */}
            <div className="flex items-center gap-3">
              {isAdmin && (
                <>
                  <Link 
                    href="/admin/upload-video"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Film className="h-4 w-4" />
                    آپلود فیلم
                  </Link>
                  <Link 
                    href="/admin/upload-series"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <Tv className="h-4 w-4" />
                    آپلود سریال
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* فیلتر سطوح */}
          <div className="mb-8">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {allLevels.map((lvl) => {
                  const lvlInfo = getLevelInfo(lvl);
                  return (
                    <Link
                      key={lvl}
                      href={`/videos-by-level/${lvl}`}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex-shrink-0 ${
                        lvl === level 
                          ? `${lvlInfo.bgColor} text-white shadow-md` 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {lvl}
                    </Link>
                  );
                })}
              </div>
              
              {/* آمار ویدیوها */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {videos.length} ویدیو
                {seriesVideos.length > 0 && ` (${seriesVideos.length} سریال)`}
              </div>
            </div>
          </div>
        </div>

        {/* سریال‌ها - بخش جداگانه */}
        {seriesVideos.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <Tv className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                سریال‌های آموزشی
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {seriesVideos.length} سریال
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {seriesVideos.map((video) => (
                <div key={video.id} className="group relative">
                  {/* دکمه‌های ادمین برای سریال */}
                  {isAdmin && (
                    <div className="absolute top-3 left-3 z-20 flex gap-2">
                      <Link
                        href={`/admin/edit-series/${video.id}`}
                        className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-110"
                        title="ویرایش سریال"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteVideoButton videoId={video.id} />
                    </div>
                  )}

                  <Link href={`/series/${video.id}`} className="block">
                    <div className="relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg dark:group-hover:shadow-gray-800/50 group-hover:border-gray-400 dark:group-hover:border-gray-600 h-full">
                      
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                        {video.thumbnailUrl || video.coverImage ? (
                          <Image 
                            src={video.thumbnailUrl || video.coverImage || ''} 
                            alt={video.title}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Tv className="h-12 w-12 text-gray-500 dark:text-gray-400 group-hover:text-white/70 transition-colors" />
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

                        {/* Series Badge */}
                        <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                          سریال
                        </div>

                        {/* Series Info */}
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-1">
                            <Tv className="h-3 w-3" />
                            <span>{video.totalSeasons} فصل</span>
                            <span className="mx-1">•</span>
                            <span>{video.totalEpisodes} قسمت</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {video.title}
                        </h3>
                        
                        {video.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {video.description}
                          </p>
                        )}
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(video.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            <span>۴.۸</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* فیلم‌های تکی */}
        {singleVideos.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Film className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                فیلم‌های آموزشی
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {singleVideos.length} فیلم
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {singleVideos.map((video) => (
                <div key={video.id} className="group relative">
                  {/* دکمه‌های ادمین برای فیلم تکی */}
                  {isAdmin && (
                    <div className="absolute top-3 left-3 z-20 flex gap-2">
                      <Link
                        href={`/admin/edit-video/${video.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-110"
                        title="ویرایش فیلم"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <DeleteVideoButton videoId={video.id} />
                    </div>
                  )}

                  <Link href={`/video/${video.id}`} className="block">
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

                        {/* Movie Badge */}
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                          فیلم
                        </div>

                        {/* Duration */}
                        {video.duration && (
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                            {formatDuration(video.duration)}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {video.title}
                        </h3>
                        
                        {video.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {video.description}
                          </p>
                        )}
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(video.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
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
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* حالت خالی - هیچ ویدیویی وجود ندارد */}
        {videos.length === 0 && (
          <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
            <div className="text-gray-400 text-8xl mb-6">🎬</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">ویدیویی یافت نشد</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              در حال حاضر ویدیویی برای سطح {level} موجود نیست
            </p>
            {isAdmin ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/admin/upload-video"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 font-semibold"
                >
                  <Film className="h-5 w-5" />
                  آپلود فیلم جدید
                </Link>
                <Link 
                  href="/admin/upload-series"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 font-semibold"
                >
                  <Tv className="h-5 w-5" />
                  آپلود سریال جدید
                </Link>
              </div>
            ) : (
              <Link 
                href="/video-levels"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-105 font-semibold"
              >
                <ArrowRight className="h-5 w-5" />
                بازگشت به سطوح
              </Link>
            )}
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