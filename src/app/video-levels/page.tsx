// app/video-levels/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Star, Target, TrendingUp, Users, Clock, Upload, ChevronLeft, Tv, Film } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  level: string;
  thumbnailUrl: string | null;
  coverImage: string | null;
  isSeries: boolean;
  totalSeasons: number;
  totalEpisodes: number;
  duration: number | null;
  description: string | null;
  createdAt: Date;
}

interface VideoLevel {
  level: string;
  title: string;
  description: string;
  color: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  estimatedTime: string;
  wordCount: string;
  learners: string;
}

const videoLevels: VideoLevel[] = [
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




async function fetchVideosByLevel(level: string): Promise<Video[]> {
  try {
    console.log(`📡 Fetching videos for level: ${level}`);
    
    const response = await fetch(`/api/videos/level/${level}?limit=4`, {
      cache: 'no-store' // اضافه کردن این خط
    });
    
    console.log(`📊 Response status for ${level}:`, response.status);
    
    if (!response.ok) {
      console.error(`❌ API error for level ${level}:`, response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    console.log(`✅ Received ${data.length} videos for level ${level}:`, data);
    
    return data;
  } catch (error) {
    console.error(`🔥 Error fetching videos for level ${level}:`, error);
    return [];
  }
}

function getLevelInfo(level: string) {
  const levels: Record<string, { bgColor: string; color: string }> = {
    'A1': { 
      bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
      color: 'from-green-500 to-emerald-600'
    },
    'A2': { 
      bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      color: 'from-blue-500 to-cyan-600'
    },
    'B1': { 
      bgColor: 'bg-gradient-to-r from-purple-500 to-violet-600',
      color: 'from-purple-500 to-violet-600'
    },
    'B2': { 
      bgColor: 'bg-gradient-to-r from-orange-500 to-amber-600',
      color: 'from-orange-500 to-amber-600'
    },
    'C1': { 
      bgColor: 'bg-gradient-to-r from-red-500 to-pink-600',
      color: 'from-red-500 to-pink-600'
    },
    'C2': { 
      bgColor: 'bg-gradient-to-r from-gray-500 to-slate-600',
      color: 'from-gray-500 to-slate-600'
    }
  };
  return levels[level] || { 
    bgColor: 'bg-gradient-to-r from-gray-500 to-slate-600',
    color: 'from-gray-500 to-slate-600'
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

export default function VideoLevelsPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videosByLevel, setVideosByLevel] = useState<Record<string, Video[]>>({});
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [totalVideos, setTotalVideos] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user?.role === 'admin') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, [session, status]);

  useEffect(() => {
    const loadVideos = async () => {
      setLoadingVideos(true);
      const promises = videoLevels.map(async (level) => {
        const videos = await fetchVideosByLevel(level.level);
        return { level: level.level, videos };
      });

      const results = await Promise.all(promises);
      const videosMap: Record<string, Video[]> = {};
      let total = 0;
      
      results.forEach(result => {
        videosMap[result.level] = result.videos;
        total += result.videos.length;
      });

      setVideosByLevel(videosMap);
      setTotalVideos(total);
      setLoadingVideos(false);
    };

    loadVideos();
  }, []);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

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
          
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  سطوح آموزشی ویدیوها
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  ویدیوهای آموزشی دسته‌بندی شده بر اساس سطح مهارت
                </p>
              </div>
              
              {/* دکمه‌های آپلود فقط برای ادمین */}
              {isAdmin && (
                <div className="flex flex-wrap gap-3">
                  <Link 
                    href="/admin/upload-video"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Upload className="w-5 h-5" />
                    آپلود ویدیو
                  </Link>
                  <Link 
                    href="/admin/upload-series"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Tv className="w-5 h-5" />
                    آپلود سریال
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}


          {/* Levels Grid با ویدیوهای افقی */}
          <div className="space-y-12">
            {videoLevels.map((level) => {
              const videos = videosByLevel[level.level] || [];
              const levelInfo = getLevelInfo(level.level);
              
              return (
                <div key={level.level} className="space-y-4">
                  {/* Level Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${level.color} shadow-md`}>
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={`text-xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                            {level.level}
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {level.title}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {level.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {videos.length > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {videos.length} ویدیو
                        </span>
                      )}
                      <Link 
                        href={`/videos-by-level/${level.level}`}
                        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                        مشاهده همه
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Videos Horizontal Scroll */}
                  {loadingVideos ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex-shrink-0 w-72">
                          <div className="relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700/50 bg-gray-100 dark:bg-gray-800/50 animate-pulse">
                            <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
                            <div className="p-4">
                              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : videos.length > 0 ? (
                    <div className="relative">
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {videos.map((video) => (
                          <Link 
                            key={video.id} 
                            href={video.isSeries ? `/series/${video.id}` : `/video/${video.id}`}
                            className="flex-shrink-0 w-72 group"
                          >
                            <div className="relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 transition-all duration-300 group-hover:shadow-lg dark:group-hover:shadow-gray-800/50 group-hover:border-gray-400 dark:group-hover:border-gray-600 h-full">
                              {/* Thumbnail */}
                              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                                {video.thumbnailUrl || video.coverImage ? (
                                  <Image 
                                    src={video.thumbnailUrl || video.coverImage || ''} 
                                    alt={video.title}
                                    width={400}
                                    height={225}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => {
                                      e.currentTarget.src = '';
                                      e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-gray-300', 'to-gray-400', 'dark:from-gray-700', 'dark:to-gray-800');
                                    }}
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
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
                                
                                {/* Badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1">
                                  {/* نوع ویدیو */}
                                  <div className={`px-2 py-1 rounded text-xs font-bold ${
                                    video.isSeries 
                                      ? 'bg-purple-600 text-white' 
                                      : 'bg-blue-600 text-white'
                                  }`}>
                                    {video.isSeries ? 'سریال' : 'فیلم'}
                                  </div>
                                  
                                  {/* Duration badge - فقط برای فیلم‌های تک قسمتی */}
                                  {!video.isSeries && video.duration && (
                                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                                      {formatDuration(video.duration)}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Level badge */}
                                <div className={`absolute top-2 right-2 ${levelInfo.bgColor} text-white px-2 py-1 rounded text-xs font-semibold`}>
                                  {video.level}
                                </div>
                                
                                {/* اطلاعات سریال */}
                                {video.isSeries && (
                                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                    <div className="flex items-center gap-1">
                                      <Tv className="h-3 w-3" />
                                      <span>{video.totalSeasons} فصل</span>
                                      <span className="mx-1">•</span>
                                      <span>{video.totalEpisodes} قسمت</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="p-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {video.title}
                                </h3>
                                
                                {/* توضیحات */}
                                {video.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                    {video.description}
                                  </p>
                                )}
                                
                                {/* اطلاعات پایین */}
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {new Date(video.createdAt).toLocaleDateString('fa-IR')}
                                    </span>
                                  </div>
                                  
                                  {/* آیکون نوع */}
                                  <div className="flex items-center gap-1">
                                    {video.isSeries ? (
                                      <>
                                        <Tv className="h-3 w-3" />
                                        <span>سریال</span>
                                      </>
                                    ) : (
                                      <>
                                        <Film className="h-3 w-3" />
                                        <span>فیلم</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                      <div className="text-4xl mb-3">🎬</div>
                      <p className="text-gray-500 dark:text-gray-400">
                        هنوز ویدیویی برای این سطح اضافه نشده است
                      </p>
                      {isAdmin && (
                        <Link 
                          href="/admin/upload-video"
                          className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          اولین ویدیو را اضافه کنید
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>


          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">6</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">سطح مختلف</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {totalVideos}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">ویدیو آموزشی</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">1000+</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">زبان‌آموز فعال</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">95%</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">رضایت‌مندی</div>
            </div>
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

          {/* Quick Links */}
          <div className="mt-12 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/videos/all"
                className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/5 dark:to-blue-600/5 p-4 rounded-xl border border-blue-500/20 dark:border-blue-500/30 hover:border-blue-500/40 dark:hover:border-blue-500/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 dark:bg-blue-500/30 rounded-lg">
                    <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">همه ویدیوها</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      مشاهده تمام ویدیوهای آموزشی
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/series/all"
                className="bg-gradient-to-r from-purple-500/10 to-pink-600/10 dark:from-purple-500/5 dark:to-pink-600/5 p-4 rounded-xl border border-purple-500/20 dark:border-purple-500/30 hover:border-purple-500/40 dark:hover:border-purple-500/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 dark:bg-purple-500/30 rounded-lg">
                    <Tv className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">سریال‌ها</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      مشاهده تمام سریال‌های آموزشی
                    </p>
                  </div>
                </div>
              </Link>
              
              <Link 
                href="/popular"
                className="bg-gradient-to-r from-orange-500/10 to-amber-600/10 dark:from-orange-500/5 dark:to-amber-600/5 p-4 rounded-xl border border-orange-500/20 dark:border-orange-500/30 hover:border-orange-500/40 dark:hover:border-orange-500/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 dark:bg-orange-500/30 rounded-lg">
                    <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">پرطرفدارها</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      پربازدیدترین ویدیوهای آموزشی
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}