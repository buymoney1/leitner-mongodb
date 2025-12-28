// components/video/AdminVideoEditForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Upload, Image, FileText, Video, Globe, Save } from 'lucide-react';

// لیست سطوح
const videoLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface VideoVocabulary {
  id: string;
  word: string;
  meaning: string;
}

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  description: string | null;
  level: string;
  subtitlesVtt: string | null;
  vocabularies: VideoVocabulary[];
}

interface AdminVideoEditFormProps {
  video: VideoData;
}

export default function AdminVideoEditForm({ video }: AdminVideoEditFormProps) {
  const { data: session, status } = useSession(); 
  const [title, setTitle] = useState(video.title || '');
  const [videoUrl, setVideoUrl] = useState(video.videoUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(video.thumbnailUrl || '');
  const [description, setDescription] = useState(video.description || '');
  const [level, setLevel] = useState(video.level || 'A1');
  const [subtitlesText, setSubtitlesText] = useState(video.subtitlesVtt || '');
  const [vocabularyText, setVocabularyText] = useState(
    video.vocabularies?.map(v => `${v.word}|${v.meaning}`).join('\n') || ''
  );
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // اگر ویدیو تغییر کرد، فرم را آپدیت کن
    if (video) {
      setTitle(video.title || '');
      setVideoUrl(video.videoUrl || '');
      setThumbnailUrl(video.thumbnailUrl || '');
      setDescription(video.description || '');
      setLevel(video.level || 'A1');
      setSubtitlesText(video.subtitlesVtt || '');
      setVocabularyText(
        video.vocabularies?.map(v => `${v.word}|${v.meaning}`).join('\n') || ''
      );
    }
  }, [video]);

  if (status === 'loading') {
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
        <p className="text-gray-600 dark:text-gray-400">فقط مدیران سیستم می‌توانند ویدیوها را ویرایش کنند.</p>
      </div>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    // پردازش لغات
    const vocabularies = vocabularyText.split('\n').map(line => {
      const parts = line.split('|');
      if (parts.length < 2) return null;
      const [word, meaning] = parts;
      return {
        word: word.trim(),
        meaning: meaning.trim(),
      };
    }).filter(vocab => vocab !== null);

    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          videoUrl, 
          thumbnailUrl: thumbnailUrl || null,
          description: description || null,
          level, 
          subtitles: subtitlesText,
          vocabularies 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ ویدیو با موفقیت ویرایش شد!');
      } else {
        setMessage(`❌ خطا: ${data.error || 'خطا در ویرایش ویدیو'}`);
      }
    } catch (error) {
      setMessage('❌ خطا در ارتباط با سرور');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('آیا از حذف این ویدیو مطمئن هستید؟ این عمل قابل بازگشت نیست.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('ویدیو با موفقیت حذف شد');
        window.location.href = '/admin/videos'; // یا هر صفحه‌ای که می‌خواهید بعد از حذف هدایت شود
      } else {
        const data = await response.json();
        alert(`خطا در حذف ویدیو: ${data.error}`);
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">ویرایش ویدیو</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">ویرایش ویدیو: {video.title}</p>
            </div>
          </div>
          
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-300 flex items-center gap-2"
          >
            <span>حذف ویدیو</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* عنوان ویدیو */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Video className="h-4 w-4 text-blue-500" />
              عنوان ویدیو
            </label>
            <input 
              id="title" 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="عنوان ویدیو (مثال: آموزش مقدماتی انگلیسی - سلام و احوالپرسی)"
              required 
            />
          </div>

          {/* لینک ویدیو */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Globe className="h-4 w-4 text-green-500" />
              لینک ویدیو
            </label>
            <input 
              id="videoUrl" 
              type="text" 
              value={videoUrl} 
              onChange={(e) => setVideoUrl(e.target.value)} 
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="لینک ویدیو (مثال: https://example.com/video.mp4)"
              required 
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">لینک مستقیم ویدیو را وارد کنید (MP4, WebM, etc.)</p>
          </div>

          {/* لینک تامبنیل */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Image className="h-4 w-4 text-purple-500" />
              لینک تصویر تامبنیل (اختیاری)
            </label>
            <input 
              id="thumbnailUrl" 
              type="text" 
              value={thumbnailUrl} 
              onChange={(e) => setThumbnailUrl(e.target.value)} 
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="لینک تصویر تامبنیل (مثال: https://example.com/thumbnail.jpg)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">اگر خالی بگذارید، تامبنیل پیش‌فرض استفاده می‌شود</p>
            
            {/* Preview thumbnail */}
            {thumbnailUrl && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">پیش‌نمایش:</p>
                <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                  <img 
                    src={thumbnailUrl} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" dy=".3em" fill="%239ca3af">Invalid URL</text></svg>';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* توضیحات */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <FileText className="h-4 w-4 text-amber-500" />
              توضیحات ویدیو (اختیاری)
            </label>
            <textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all min-h-[100px]"
              placeholder="توضیحات مختصر درباره محتوای ویدیو..."
              rows={3}
            />
          </div>

          {/* سطح ویدیو */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              سطح ویدیو
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {videoLevels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    level === lvl 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="text-lg font-bold">{lvl}</div>
                  <div className="text-xs mt-1">
                    {lvl === 'A1' ? 'مبتدی' :
                     lvl === 'A2' ? 'مقدماتی' :
                     lvl === 'B1' ? 'متوسط' :
                     lvl === 'B2' ? 'بالاتر از متوسط' :
                     lvl === 'C1' ? 'پیشرفته' : 'مسلط'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* لغات */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              لغت‌ها و عبارت‌های مهم
            </label>
            <textarea
              id="vocabulary"
              value={vocabularyText}
              onChange={(e) => setVocabularyText(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[120px]"
              placeholder="Hello|سلام
World|جهان
How are you?|حالت چطوره؟
Good morning|صبح بخیر
Thank you|ممنون"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• هر خط یک لغت (فرمت: انگلیسی|فارسی)</p>
              <p>• از کاراکتر | برای جدا کردن انگلیسی و فارسی استفاده کنید</p>
              <p>• مثال: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">Hello|سلام</code></p>
            </div>
          </div>

          {/* زیرنویس */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900 dark:text-white">
              زیرنویس (فرمت VTT)
            </label>
            <textarea 
              id="subtitles" 
              value={subtitlesText} 
              onChange={(e) => setSubtitlesText(e.target.value)} 
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all min-h-[200px]"
              placeholder="WEBVTT

00:00:00.000 --> 00:00:03.500
Hello, how are you?
سلام، حال شما چطور است؟

00:00:03.500 --> 00:00:06.000
I am fine, thank you.
من خوبم، ممنون.

00:00:06.000 --> 00:00:09.000
What is your name?
اسم شما چیست؟"
              required 
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• فرمت استاندارد VTT را رعایت کنید</p>
              <p>• هر بخش شامل: زمان‌بندی + خط انگلیسی + خط فارسی</p>
              <p>• حتماً با <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">WEBVTT</code> شروع شود</p>
            </div>
          </div>

          {/* دکمه‌های اقدام */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></div>
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  ذخیره تغییرات
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-xl transition-colors duration-300"
            >
              انصراف
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