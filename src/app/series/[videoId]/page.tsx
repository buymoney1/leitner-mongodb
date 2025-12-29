// app/series/[videoId]/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { 
  Play, 
  Calendar, 
  Clock, 
  Star, 
  Users, 
  ChevronLeft,
  CheckCircle,
  Globe,
  Award
} from 'lucide-react';
import Link from 'next/link';
import EpisodeList from '@/components/video/EpisodeList';

const prisma = new PrismaClient();

async function getSeriesDetails(videoId: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        seasons: {
          include: {
            episodes: {
              include: {
                vocabularies: true
              },
              orderBy: {
                episodeNumber: 'asc'
              }
            }
          },
          orderBy: {
            seasonNumber: 'asc'
          }
        },
        vocabularies: true,
        createdBy: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    if (!video || !video.isSeries) {
      return null;
    }

    return video;
  } catch (error) {
    console.error('Error fetching series:', error);
    return null;
  }
}

export default async function SeriesDetailPage({ 
  params 
}: { 
  params: Promise<{ videoId: string }> 
}) {
  const { videoId } = await params;
  const series = await getSeriesDetails(videoId);

  if (!series) {
    notFound();
  }

  // محاسبه مدت زمان کل
  const totalDuration = series.seasons.reduce((total, season) => {
    return total + season.episodes.reduce((epTotal, episode) => 
      epTotal + (episode.duration || 0), 0);
  }, 0);

  const totalHours = Math.floor(totalDuration / 3600);
  const totalMinutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* بنر سریال */}
      <div className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        {series.coverImage ? (
          <Image
            src={series.coverImage}
            alt={series.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-pink-900" />
        )}
        
        {/* گرادیانت روی بنر */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent" />
        
        {/* محتوای بنر */}
        <div className="relative z-10 h-full flex items-end">
          <div className="w-full px-4 md:px-8 pb-6 md:pb-12">
            <div className=" mx-auto">
              <Link 
                href="/video-levels"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 md:mb-6 transition-colors text-sm md:text-base"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                بازگشت
              </Link>
              
              <div className="mb-3 md:mb-4">
                <span className="px-2 py-1 md:px-3 bg-blue-600 rounded-full text-xs md:text-sm font-medium">
                  سطح {series.level}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 leading-tight">
                {series.title}
              </h1>
              
              <p className="text-sm md:text-lg text-justify text-gray-300 mb-4 md:mb-8 line-clamp-2 md:line-clamp-none">
                {series.description || 'سریال آموزشی زبان انگلیسی'}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-4 md:mb-8">
                <div className="flex items-center gap-1 md:gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <span className="text-xs md:text-base">{series.releaseYear || new Date().getFullYear()}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  <span className="text-xs md:text-base">
                    {totalHours > 0 ? `${totalHours} ساعت و ` : ''}{totalMinutes} دقیقه
                  </span>
                </div>


              </div>
              
      
      
<div className="flex flex-wrap gap-2 md:gap-4">
  {series.seasons.length > 0 && series.seasons[0].episodes.length > 0 ? (
    <Link 
      href={`/watch/${series.id}/${series.seasons[0].seasonNumber}/${series.seasons[0].episodes[0].episodeNumber}`}
      className="flex-1 md:flex-none px-4 py-2 md:px-8 md:py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm md:text-base justify-center"
    >
      <Play className="h-4 w-4 md:h-5 md:w-5" />
      پخش قسمت اول
    </Link>
  ) : (
    <button 
      disabled
      className="flex-1 md:flex-none px-4 py-2 md:px-8 md:py-3 bg-gray-500 rounded-lg font-bold flex items-center gap-2 text-sm md:text-base justify-center cursor-not-allowed"
    >
      <Play className="h-4 w-4 md:h-5 md:w-5" />
      قسمتی برای پخش وجود ندارد
    </button>
  )}


</div>
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات سریال */}
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* بخش اصلی */}
          <div className="lg:col-span-2">
            {/* آمار سریال */}
            <div className="bg-gray-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 backdrop-blur-sm border border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-purple-400">
                    {series.totalSeasons}
                  </div>
                  <div className="text-gray-400 mt-1 text-xs md:text-base">فصل</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-blue-400">
                    {series.totalEpisodes}
                  </div>
                  <div className="text-gray-400 mt-1 text-xs md:text-base">قسمت</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-green-400">
                    {Math.floor(totalDuration / 60)}
                  </div>
                  <div className="text-gray-400 mt-1 text-xs md:text-base">دقیقه</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-yellow-400">
                    {series.vocabularies.length + series.seasons.reduce((total, season) => 
                      total + season.episodes.reduce((epTotal, episode) => 
                        epTotal + episode.vocabularies.length, 0), 0)}
                  </div>
                  <div className="text-gray-400 mt-1 text-xs md:text-base">لغت جدید</div>
                </div>
              </div>
            </div>

            {/* لیست فصل‌ها و قسمت‌ها */}
            <div className="space-y-6 md:space-y-8">
              {series.seasons.map((season) => (
                <div key={season.id} className="bg-gray-800/50 rounded-xl md:rounded-2xl overflow-hidden border border-gray-700">
                  <div className="p-4 md:p-6 border-b border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg md:text-2xl font-bold">
                          فصل {season.seasonNumber}: {season.title}
                        </h2>
                        {season.description && (
                          <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
                            {season.description}
                          </p>
                        )}
                      </div>
                      <div className="px-3 py-1 bg-gray-700 rounded-lg self-start md:self-center">
                        <span className="text-xs md:text-sm">
                          {season.episodes.length} قسمت
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <EpisodeList 
                    season={season} 
                    seriesId={series.id} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* سایدبار */}
          <div className="space-y-4 md:space-y-6">
            {/* اطلاعات کلی */}



    
    

            {/* ویژگی‌ها */}
            <div className="mb-12 bg-gray-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-700">
              <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">ویژگی‌ها</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  <span className="text-sm md:text-base">زیرنویس دوزبانه</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  <span className="text-sm md:text-base">لغات هر قسمت</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  <span className="text-sm md:text-base">افزودن لغات به لایتنر شخصی</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                  <span className="text-sm md:text-base">کیفیت بالا</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}