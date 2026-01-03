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
  Award,
  Film,
  BookOpen,
  Folder,
  Zap,
  Target,
  BarChart3,
  Heart,
  Download,
  Eye,
  Share2
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
  const totalEpisodes = series.totalEpisodes || series.seasons.reduce((total, season) => 
    total + season.episodes.length, 0);
  const totalSeasons = series.totalSeasons || series.seasons.length;
  const totalVocabularies = series.vocabularies.length + series.seasons.reduce((total, season) => 
    total + season.episodes.reduce((epTotal, episode) => 
      epTotal + episode.vocabularies.length, 0), 0);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* بنر سریال */}
      <div className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        {series.coverImage ? (
          <>
            <Image
              src={series.coverImage}
              alt={series.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* گرادیانت روی بنر */}
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 via-white/70 dark:via-gray-900/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 dark:from-gray-900/50 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 dark:from-purple-900 to-pink-100 dark:to-pink-900" />
        )}
        
        {/* محتوای بنر */}
        <div className="relative z-10 h-full flex items-end">
          <div className="w-full px-4 md:px-8 pb-6 md:pb-12">
            <div className="mx-auto">
              <Link 
                href="/video-levels"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-4 md:mb-6 transition-colors text-sm md:text-base"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                بازگشت
              </Link>
              
              <div className="mb-3 md:mb-4">
                <span className="px-2 py-1 md:px-3 bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-blue-100 rounded-full text-xs md:text-sm font-medium">
                  سطح {series.level}
                </span>
              </div>
              
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-6 leading-tight text-gray-900 dark:text-white">
                {series.title}
              </h1>
              
              <p className="text-sm md:text-lg text-justify text-gray-700 dark:text-gray-300 mb-4 md:mb-8 line-clamp-2 md:line-clamp-none">
                {series.description || 'سریال آموزشی زبان انگلیسی'}
              </p>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-6 mb-4 md:mb-8">
                <div className="flex items-center gap-1 md:gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-base">{series.releaseYear || new Date().getFullYear()}</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="text-xs md:text-base">
                    {totalHours > 0 ? `${totalHours} ساعت و ` : ''}{totalMinutes} دقیقه
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 md:gap-4">
                {series.seasons.length > 0 && series.seasons[0].episodes.length > 0 ? (
                  <Link 
                    href={`/watch/${series.id}/${series.seasons[0].seasonNumber}/${series.seasons[0].episodes[0].episodeNumber}`}
                    className="flex-1 md:flex-none px-4 py-2 md:px-8 md:py-3 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 transition-colors text-sm md:text-base justify-center"
                  >
                    <Play className="h-4 w-4 md:h-5 md:w-5" />
                    پخش قسمت اول
                  </Link>
                ) : (
                  <button 
                    disabled
                    className="flex-1 md:flex-none px-4 py-2 md:px-8 md:py-3 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-bold flex items-center gap-2 text-sm md:text-base justify-center cursor-not-allowed"
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
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 backdrop-blur-sm border border-gray-300 dark:border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {totalSeasons}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs md:text-base">فصل</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {totalEpisodes}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs md:text-base">قسمت</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                    {Math.floor(totalDuration / 60)}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs md:text-base">دقیقه</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {totalVocabularies}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1 text-xs md:text-base">لغت جدید</div>
                </div>
              </div>
            </div>

            {/* لیست فصل‌ها و قسمت‌ها */}
            <div className="space-y-6 md:space-y-8">
              {series.seasons.map((season) => (
                <div key={season.id} className="bg-gray-100 dark:bg-gray-800/50 rounded-xl md:rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700">
                  <div className="p-4 md:p-6 border-b border-gray-300 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                          فصل {season.seasonNumber}: {season.title}
                        </h2>
                        {season.description && (
                          <p className="text-justify text-gray-700 dark:text-gray-400 mt-1 md:mt-2 text-sm md:text-base">
                            {season.description}
                          </p>
                        )}
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

          {/* سایدبار بهبود یافته */}
          <div className="space-y-6 md:space-y-8">
            {/* ویژگی‌ها */}
            <div className="bg-white dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700/50">
              <h3 className="text-lg md:text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
                ویژگی‌های سریال
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white text-sm md:text-base block mb-1">
                      زیرنویس دوزبانه
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                      فارسی و انگلیسی با هماهنگی کامل
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white text-sm md:text-base block mb-1">
                      لغات هر قسمت
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                      استخراج خودکار از زیرنویس‌ها
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white text-sm md:text-base block mb-1">
                      سیستم لایتنر
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                      افزودن لغات به فلش کارت شخصی
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-white text-sm md:text-base block mb-1">
                      کیفیت بالا
                    </span>
                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                      ویدیو با رزولوشن بالا
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* سطح آموزشی */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 md:p-8 shadow-xl border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  سطح آموزشی
                </h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">سطح فعلی</div>
                  <div className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {series.level}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                  این سریال برای زبان‌آموزان سطح {series.level} طراحی شده و کمک می‌کند تا مهارت‌های خود را تقویت کنید.
                </p>
              </div>
            </div>

            {/* نکته آموزشی */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 md:p-8 shadow-xl border border-green-200 dark:border-green-800/30">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400" />
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  نکته آموزشی
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed">
                برای بهترین نتیجه، هر قسمت را دو بار تماشا کنید: بار اول بدون زیرنویس و بار دوم با زیرنویس. همچنین لغات جدید را به سیستم لایتنر اضافه کنید.
              </p>
              <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800/30">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>توصیه شده توسط مدرسان زبان</span>
                </div>
              </div>
            </div>

            {/* نکات مطالعه */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 md:p-8 shadow-xl border border-purple-200 dark:border-purple-800/30">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  نکات مطالعه
                </h3>
              </div>
              <ul className="space-y-3 text-sm md:text-base">
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 mt-2 bg-purple-500 rounded-full" />
                  <span>هر روز یک قسمت تماشا کنید</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 mt-2 bg-purple-500 rounded-full" />
                  <span>لغات جدید را در جملات تمرین کنید</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 mt-2 bg-purple-500 rounded-full" />
                  <span>تلفظ خود را با ویدیو مقایسه کنید</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 mt-2 bg-purple-500 rounded-full" />
                  <span>هر هفته مرور لغات هفته قبل</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}