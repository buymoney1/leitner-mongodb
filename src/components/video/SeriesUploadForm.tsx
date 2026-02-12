// components/video/SeriesUploadForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Upload, Video, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const videoLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface EpisodeFormData {
  episodeNumber: number;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  duration: number;
  subtitlesVtt: string;
  vocabularies: { word: string; meaning: string }[];
}

interface SeasonFormData {
  id?: string;
  seasonNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  episodes: EpisodeFormData[];
}

interface SeriesUploadFormProps {
  seriesId?: string; // اگر وجود داشته باشد، در حالت ویرایش هستیم
  onSuccess?: () => void;
}

export default function SeriesUploadForm({ seriesId, onSuccess }: SeriesUploadFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!seriesId);
  const [message, setMessage] = useState('');
  
  // اطلاعات اصلی سریال
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [level, setLevel] = useState('A1');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [totalSeasons, setTotalSeasons] = useState(1);
  
  // فصل‌ها
  const [seasons, setSeasons] = useState<SeasonFormData[]>([
    {
      seasonNumber: 1,
      title: 'فصل ۱',
      description: '',
      thumbnailUrl: '',
      episodes: [
        {
          episodeNumber: 1,
          title: 'قسمت ۱',
          videoUrl: '',
          thumbnailUrl: '',
          description: '',
          duration: 1200,
          subtitlesVtt: '',
          vocabularies: []
        }
      ]
    }
  ]);
  
  // لغات عمومی سریال
  const [generalVocabText, setGeneralVocabText] = useState('');

  // بارگذاری اطلاعات سریال در حالت ویرایش
  useEffect(() => {
    if (seriesId) {
      const fetchSeriesData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/admin/series/${seriesId}/edit`);
          if (!response.ok) throw new Error('خطا در دریافت اطلاعات سریال');
          
          const data = await response.json();
          
          // پر کردن اطلاعات اصلی
          setTitle(data.title || '');
          setDescription(data.description || '');
          setCoverImage(data.coverImage || '');
          setLevel(data.level || 'A1');
          setReleaseYear(data.releaseYear || new Date().getFullYear());
          
          // پر کردن لغات عمومی
          if (data.generalVocabularies && data.generalVocabularies.length > 0) {
            const vocabText = data.generalVocabularies
              .map((v: any) => `${v.word}|${v.meaning}`)
              .join('\n');
            setGeneralVocabText(vocabText);
          }
          
          // پر کردن فصل‌ها و قسمت‌ها
          if (data.seasons && data.seasons.length > 0) {
            const formattedSeasons = data.seasons.map((season: any) => ({
              id: season.id,
              seasonNumber: season.seasonNumber,
              title: season.title,
              description: season.description || '',
              thumbnailUrl: season.thumbnailUrl || '',
              episodes: season.episodes.map((episode: any) => ({
                id: episode.id,
                episodeNumber: episode.episodeNumber,
                title: episode.title,
                videoUrl: episode.videoUrl || '',
                thumbnailUrl: episode.thumbnailUrl || '',
                description: episode.description || '',
                duration: episode.duration || 1200,
                subtitlesVtt: episode.subtitlesVtt || '',
                vocabularies: episode.vocabularies || []
              }))
            }));
            setSeasons(formattedSeasons);
            setTotalSeasons(formattedSeasons.length);
          }
        } catch (error) {
          console.error('Error fetching series:', error);
          setMessage('❌ خطا در دریافت اطلاعات سریال');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSeriesData();
    }
  }, [seriesId]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="text-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return (
      <div className="text-center p-8 max-w-md mx-auto">
        <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">دسترسی محدود</h3>
        <p className="text-gray-600 dark:text-gray-400">فقط مدیران سیستم می‌توانند سریال آپلود کنند.</p>
      </div>
    );
  }

  // افزودن فصل جدید
  const addSeason = () => {
    const newSeasonNumber = seasons.length + 1;
    setSeasons([
      ...seasons,
      {
        seasonNumber: newSeasonNumber,
        title: `فصل ${newSeasonNumber}`,
        description: '',
        thumbnailUrl: '',
        episodes: [
          {
            episodeNumber: 1,
            title: `قسمت ۱`,
            videoUrl: '',
            thumbnailUrl: '',
            description: '',
            duration: 1200,
            subtitlesVtt: '',
            vocabularies: []
          }
        ]
      }
    ]);
    setTotalSeasons(newSeasonNumber);
  };

  // حذف فصل
  const removeSeason = (index: number) => {
    if (seasons.length > 1) {
      const newSeasons = seasons.filter((_, i) => i !== index);
      // بروزرسانی شماره فصل‌ها
      const renumberedSeasons = newSeasons.map((season, idx) => ({
        ...season,
        seasonNumber: idx + 1
      }));
      setSeasons(renumberedSeasons);
      setTotalSeasons(renumberedSeasons.length);
    }
  };

  // افزودن قسمت به فصل
  const addEpisode = (seasonIndex: number) => {
    const newSeasons = [...seasons];
    const season = newSeasons[seasonIndex];
    const newEpisodeNumber = season.episodes.length + 1;
    
    season.episodes.push({
      episodeNumber: newEpisodeNumber,
      title: `قسمت ${newEpisodeNumber}`,
      videoUrl: '',
      thumbnailUrl: '',
      description: '',
      duration: 1200,
      subtitlesVtt: '',
      vocabularies: []
    });
    
    setSeasons(newSeasons);
  };

  // حذف قسمت
  const removeEpisode = (seasonIndex: number, episodeIndex: number) => {
    const newSeasons = [...seasons];
    const season = newSeasons[seasonIndex];
    
    if (season.episodes.length > 1) {
      season.episodes = season.episodes.filter((_, i) => i !== episodeIndex);
      // بروزرسانی شماره قسمتها
      season.episodes = season.episodes.map((episode, idx) => ({
        ...episode,
        episodeNumber: idx + 1
      }));
      setSeasons(newSeasons);
    }
  };

  // بروزرسانی فصل
  const updateSeason = (index: number, field: keyof SeasonFormData, value: any) => {
    const newSeasons = [...seasons];
    newSeasons[index] = { ...newSeasons[index], [field]: value };
    setSeasons(newSeasons);
  };

  // بروزرسانی قسمت
  const updateEpisode = (seasonIndex: number, episodeIndex: number, field: keyof EpisodeFormData, value: any) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes[episodeIndex] = {
      ...newSeasons[seasonIndex].episodes[episodeIndex],
      [field]: value
    };
    setSeasons(newSeasons);
  };

  // بروزرسانی لغات قسمت
  const updateEpisodeVocabulary = (seasonIndex: number, episodeIndex: number, vocabText: string) => {
    const vocabularies = vocabText.split('\n').map(line => {
      const parts = line.split('|');
      if (parts.length < 2) return null;
      return {
        word: parts[0].trim(),
        meaning: parts[1].trim()
      };
    }).filter(v => v !== null) as { word: string; meaning: string }[];
    
    updateEpisode(seasonIndex, episodeIndex, 'vocabularies', vocabularies);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    // پردازش لغات عمومی
    const generalVocabularies = generalVocabText.split('\n').map(line => {
      const parts = line.split('|');
      if (parts.length < 2) return null;
      return {
        word: parts[0].trim(),
        meaning: parts[1].trim()
      };
    }).filter(v => v !== null) as { word: string; meaning: string }[];

    try {
      const url = seriesId 
        ? `/api/admin/series/${seriesId}/edit` 
        : '/api/admin/upload-series';
      
      const method = seriesId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          coverImage,
          level,
          releaseYear: parseInt(releaseYear.toString()),
          isSeries: true,
          totalSeasons,
          totalEpisodes: seasons.reduce((total, season) => total + season.episodes.length, 0),
          generalVocabularies,
          seasons
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(seriesId ? '✅ سریال با موفقیت ویرایش شد!' : '✅ سریال با موفقیت آپلود شد!');
        
        if (!seriesId) {
          // ریست فرم فقط در حالت آپلود جدید
          setTitle('');
          setDescription('');
          setCoverImage('');
          setLevel('A1');
          setReleaseYear(new Date().getFullYear());
          setSeasons([{
            seasonNumber: 1,
            title: 'فصل ۱',
            description: '',
            thumbnailUrl: '',
            episodes: [{
              episodeNumber: 1,
              title: 'قسمت ۱',
              videoUrl: '',
              thumbnailUrl: '',
              description: '',
              duration: 1200,
              subtitlesVtt: '',
              vocabularies: []
            }]
          }]);
          setGeneralVocabText('');
        }
        
        if (onSuccess) {
          onSuccess();
        }
        
        // ریدایرکت به صفحه سریال در حالت ویرایش
        if (seriesId) {
          setTimeout(() => {
            router.push(`/series/${seriesId}`);
          }, 2000);
        }
      } else {
        setMessage(`❌ خطا: ${data.error || 'خطا در ' + (seriesId ? 'ویرایش' : 'آپلود') + ' سریال'}`);
      }
    } catch (error) {
      setMessage(`❌ خطا در ارتباط با سرور`);
      console.error('Upload error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {seriesId ? 'ویرایش سریال' : 'آپلود سریال جدید'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {seriesId ? 'ویرایش اطلاعات سریال' : 'سریال‌های آموزشی فصل‌بندی شده'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* اطلاعات اصلی سریال */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Video className="h-5 w-5 text-purple-500" />
              اطلاعات اصلی سریال
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  عنوان سریال
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="عنوان سریال"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  سطح آموزشی
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {videoLevels.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  سال انتشار
                </label>
                <input
                  type="number"
                  value={releaseYear}
                  onChange={(e) => setReleaseYear(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="2000"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  لینک بنر (کاور) سریال
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  توضیحات سریال
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[100px]"
                  placeholder="توضیحات درباره سریال..."
                />
              </div>
            </div>
          </div>

          {/* لغات عمومی سریال */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              لغات عمومی سریال (اختیاری)
            </h3>
            <textarea
              value={generalVocabText}
              onChange={(e) => setGeneralVocabText(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm min-h-[120px]"
              placeholder="word|معنی
vocabulary|واژگان
grammar|گرامر"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              هر خط یک لغت (فرمت: انگلیسی|فارسی)
            </p>
          </div>

          {/* فصل‌ها */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                فصل‌های سریال ({seasons.length} فصل)
              </h3>
              <button
                type="button"
                onClick={addSeason}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                افزودن فصل جدید
              </button>
            </div>

            {seasons.map((season, seasonIndex) => (
              <div key={seasonIndex} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        فصل {season.seasonNumber}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={season.title}
                      onChange={(e) => updateSeason(seasonIndex, 'title', e.target.value)}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                      placeholder="عنوان فصل"
                    />
                  </div>
                  
                  {seasons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSeason(seasonIndex)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="mb-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    توضیحات فصل
                  </label>
                  <textarea
                    value={season.description}
                    onChange={(e) => updateSeason(seasonIndex, 'description', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[80px]"
                    placeholder="توضیحات این فصل..."
                  />
                </div>

                <div className="mb-4 space-y-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    لینک تامبنیل فصل (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={season.thumbnailUrl}
                    onChange={(e) => updateSeason(seasonIndex, 'thumbnailUrl', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://example.com/season-thumbnail.jpg"
                  />
                </div>

                {/* قسمت‌های فصل */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-bold text-gray-900 dark:text-white">
                      قسمت‌های فصل ({season.episodes.length} قسمت)
                    </h4>
                    <button
                      type="button"
                      onClick={() => addEpisode(seasonIndex)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-1 text-sm"
                    >
                      <Plus className="h-3 w-3" />
                      افزودن قسمت
                    </button>
                  </div>

                  {season.episodes.map((episode, episodeIndex) => (
                    <div key={episodeIndex} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              قسمت {episode.episodeNumber}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={episode.title}
                            onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'title', e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="عنوان قسمت"
                          />
                        </div>
                        
                        {season.episodes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEpisode(seasonIndex, episodeIndex)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900 dark:text-white">
                            لینک ویدیو
                          </label>
                          <input
                            type="text"
                            value={episode.videoUrl}
                            onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'videoUrl', e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="https://example.com/episode.mp4"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900 dark:text-white">
                            مدت زمان (ثانیه)
                          </label>
                          <input
                            type="number"
                            value={episode.duration}
                            onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'duration', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="mb-3 space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          لینک تامبنیل (اختیاری)
                        </label>
                        <input
                          type="text"
                          value={episode.thumbnailUrl}
                          onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'thumbnailUrl', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="https://example.com/episode-thumb.jpg"
                        />
                      </div>

                      <div className="mb-3 space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          توضیحات قسمت
                        </label>
                        <textarea
                          value={episode.description}
                          onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[60px]"
                          placeholder="توضیحات این قسمت..."
                        />
                      </div>

                      <div className="mb-3 space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          زیرنویس VTT (اختیاری)
                        </label>
                        <textarea
                          value={episode.subtitlesVtt}
                          onChange={(e) => updateEpisode(seasonIndex, episodeIndex, 'subtitlesVtt', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm min-h-[80px]"
                          placeholder="WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nHello\nسلام"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                          لغات این قسمت
                        </label>
                        <textarea
                          defaultValue={episode.vocabularies?.map(v => `${v.word}|${v.meaning}`).join('\n')}
                          onChange={(e) => updateEpisodeVocabulary(seasonIndex, episodeIndex, e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm min-h-[80px]"
                          placeholder="word|معنی"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* دکمه ارسال */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></div>
                  {seriesId ? 'در حال ویرایش...' : 'در حال آپلود...'}
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  {seriesId ? 'ویرایش سریال' : 'آپلود سریال'}
                </>
              )}
            </button>
          </div>

          {/* پیام وضعیت */}
          {message && (
            <div className={`p-4 rounded-xl border ${
              message.includes('✅') 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
              <div className="flex items-center gap-2">
                {message.includes('✅') ? '✅' : '❌'}
                <p>{message}</p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}