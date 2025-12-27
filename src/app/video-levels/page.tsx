// app/video-levels/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Star, Target, TrendingUp, Users, Clock, Upload, ChevronLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  level: string;
  thumbnailUrl: string | null;
  duration: string | null;
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
    const response = await fetch(`/api/videos/level/${level}?limit=4`);
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching videos for level ${level}:`, error);
    return [];
  }
}

function getLevelInfo(level: string) {
  const levels: Record<string, { bgColor: string }> = {
    'A1': { bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    'A2': { bgColor: 'bg-gradient-to-r from-blue-500 to-cyan-600' },
    'B1': { bgColor: 'bg-gradient-to-r from-purple-500 to-violet-600' },
    'B2': { bgColor: 'bg-gradient-to-r from-orange-500 to-amber-600' },
    'C1': { bgColor: 'bg-gradient-to-r from-red-500 to-pink-600' },
    'C2': { bgColor: 'bg-gradient-to-r from-gray-500 to-slate-600' }
  };
  return levels[level] || { bgColor: 'bg-gradient-to-r from-gray-500 to-slate-600' };
}

export default function VideoLevelsPage() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videosByLevel, setVideosByLevel] = useState<Record<string, Video[]>>({});
  const [loadingVideos, setLoadingVideos] = useState(true);

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
      
      results.forEach(result => {
        videosMap[result.level] = result.videos;
      });

      setVideosByLevel(videosMap);
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
          <div className="mb-10 flex justify-between mb-8 ">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              سطوح آموزشی ویدیوها
            </h1>
     {/* دکمه آپلود فقط برای ادمین */}
     {isAdmin && (
            <div className=" flex justify-end">
              <Link 
                href="/admin/upload-video"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Upload className="w-5 h-5" />
                آپلود ویدیو جدید
              </Link>
            </div>
          )}
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
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${level.color} shadow-md`}>
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className={`text-xl font-bold bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                          {level.level}
                        </div>
                        <div className="text-xs text-gray-900 dark:text-white font-semibold">
                          {level.title}
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/videos-by-level/${level.level}`}
                      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                      مشاهده همه
                      <ChevronLeft className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Videos Horizontal Scroll */}
                  {loadingVideos ? (
                    <div className="flex gap-4 overflow-x-auto pb-4">
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
                            href={`/video/${video.id}`}
                            className="flex-shrink-0 w-72 group"
                          >
                            <div className="relative overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 transition-all duration-300 group-hover:shadow-lg dark:group-hover:shadow-gray-800/50 group-hover:border-gray-400 dark:group-hover:border-gray-600 h-full">
                              {/* Thumbnail */}
                              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800">
                                {video.thumbnailUrl ? (
                                  <Image 
                                    src={video.thumbnailUrl} 
                                    alt={video.title}
                                    width={400}
                                    height={225}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Play className="h-12 w-12 text-gray-500 dark:text-gray-400 group-hover:text-white/70 transition-colors" />
                                  </div>
                                )}
                                
                                {/* Duration badge */}
                                {video.duration && (
                                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {video.duration}
                                  </div>
                                )}
                                
                                {/* Level badge */}
                                <div className={`absolute top-2 right-2 ${levelInfo.bgColor} text-white px-2 py-1 rounded text-xs font-semibold`}>
                                  {video.level}
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className="p-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {video.title}
                                </h3>
                                
                        
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400">
                        هنوز ویدیویی برای این سطح اضافه نشده است
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-8 ">
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">6</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">سطح مختلف</div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm text-center">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {Object.values(videosByLevel).flat().length}
              </div>
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