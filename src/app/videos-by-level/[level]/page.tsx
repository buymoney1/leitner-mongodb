// app/videos-by-level/[level]/page.tsx
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import { ArrowRight, Play, Clock, Users, Star, Filter, Search } from 'lucide-react';

const prisma = new PrismaClient();

async function getVideosByLevel(level: string) {
  const videos = await prisma.video.findMany({
    where: { level: level as any },
    orderBy: { createdAt: 'desc' },
    // include حذف شده چون فیلد userProgress وجود ندارد
  });
  return videos;
}

function getLevelInfo(level: string) {
  const levels = {
    'A1': { title: 'مبتدی', color: 'from-green-500 to-emerald-600', description: 'شروع یادگیری انگلیسی' },
    'A2': { title: 'مقدماتی', color: 'from-blue-500 to-cyan-600', description: 'مکالمات ساده روزمره' },
    'B1': { title: 'متوسط', color: 'from-purple-500 to-violet-600', description: 'مکالمات پیشرفته‌تر' },
    'B2': { title: 'بالاتر از متوسط', color: 'from-orange-500 to-amber-600', description: 'مهارت‌های ارتباطی قوی' },
    'C1': { title: 'پیشرفته', color: 'from-red-500 to-pink-600', description: 'سطح حرفه‌ای' },
    'C2': { title: 'مسلط', color: 'from-gray-500 to-slate-600', description: 'سطح native' }
  };
  return levels[level as keyof typeof levels] || { title: level, color: 'from-gray-500 to-slate-600', description: 'ویدیوهای آموزشی' };
}

export default async function LevelVideosPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const videos = await getVideosByLevel(level);
  const levelInfo = getLevelInfo(level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      <div className={`absolute top-1/4 -left-10 w-72 h-72 ${levelInfo.color.replace('from-', 'bg-').replace(' to-', '/10')} rounded-full blur-3xl opacity-20`}></div>
      <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link key={video.id} href={`/video/${video.id}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/50 to-gray-900/30 backdrop-blur-xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl h-full">
                  
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
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <Play className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
                        <Play className="h-8 w-8 text-white fill-white" />
                      </div>
                    </div>

                    {/* Duration */}
                    {video.duration && (
                      <div className="absolute bottom-3 left-3 bg-black/80 text-white px-2 py-1 rounded-lg text-xs backdrop-blur-sm">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                      </div>
                    )}

                    {/* Level Badge */}
                    <div className={`absolute top-3 right-3 bg-gradient-to-r ${levelInfo.color} text-white px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm`}>
                      {video.level}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300 leading-relaxed">
                      {video.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {video.description || 'توضیحات ویدیو'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
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
                      {video.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{video.duration} دقیقه</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Effects */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${levelInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-6">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-3">ویدیویی یافت نشد</h3>
            <p className="text-gray-400 text-lg mb-6">
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
            className="text-xs inline-flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 border border-gray-700 hover:border-gray-600 font-medium"
          >
            <ArrowRight className="h-4 w-4" />
            مشاهده همه سطوح
          </Link>
        </div>
      </div>
    </div>
  );
}