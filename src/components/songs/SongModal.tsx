// app/songs/components/SongModal.tsx
import { useState, useEffect } from 'react';
import { X, Music, User, Disc, Clock, Link, FileText } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  lyrics: string;
  isPublished: boolean;
}

interface SongFormData {
  title: string;
  artist: string;
  album: string;
  duration: string;
  audioUrl: string;
  coverUrl: string;
  lyrics: string;
  isPublished: boolean;
}

interface SongModalProps {
  song?: Song | null;
  onClose: () => void;
  onSave: (data: SongFormData) => void;
  loading?: boolean;
}

export default function SongModal({ song, onClose, onSave, loading = false }: SongModalProps) {
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    artist: '',
    album: '',
    duration: '',
    audioUrl: '',
    coverUrl: '',
    lyrics: '',
    isPublished: true,
  });

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title,
        artist: song.artist,
        album: song.album || '',
        duration: song.duration.toString(),
        audioUrl: song.audioUrl,
        coverUrl: song.coverUrl || '',
        lyrics: song.lyrics,
        isPublished: song.isPublished,
      });
    }
  }, [song]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {song ? 'ویرایش آهنگ' : 'افزودن آهنگ جدید'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <Music className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
                عنوان آهنگ *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="عنوان آهنگ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <User className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
                خواننده *
              </label>
              <input
                type="text"
                required
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="نام خواننده"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <Disc className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
                آلبوم
              </label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="نام آلبوم"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <Clock className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
                مدت زمان (ثانیه) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="مدت زمان به ثانیه"
              />
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <Link className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
                لینک فایل صوتی *
              </label>
              <input
                type="url"
                required
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="https://example.com/song.mp3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                <Link className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
                لینک کاور آهنگ
              </label>
              <input
                type="url"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                className="w-full px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
              <FileText className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
              متن آهنگ با ترجمه *
            </label>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2 md:mb-3">
              هر خط انگلیسی، سپس خط فارسی، سپس یک خط خالی (Enter)
            </p>
            <textarea
              required
              value={formData.lyrics}
              onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              rows={8}
              className="w-full px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors font-mono text-xs md:text-sm resize-y min-h-[150px]"
              placeholder={`I'm walking on sunshine
من روی نور خورشید راه میرم

And don't it feel good
و چه حس خوبیه

Hey, all right now
هی، الان خوبم

And don't it feel good
و چه حس خوبیه`}
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between p-3 md:p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg md:rounded-xl">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="sr-only"
              />
              <div className={`relative w-12 h-6 md:w-14 md:h-7 rounded-full transition-colors ${
                formData.isPublished ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
              }`}>
                <div className={`absolute top-1 left-1 w-4 h-4 md:w-5 md:h-5 rounded-full transition-transform ${
                  formData.isPublished ? 'transform translate-x-6 md:translate-x-7 bg-white' : 'bg-gray-200 dark:bg-gray-300'
                }`} />
              </div>
              <span className="mr-2 md:mr-3 text-sm text-gray-700 dark:text-gray-300">
                {formData.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 md:gap-3 pt-4 md:pt-6 border-t border-gray-300 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 md:px-6 py-2 md:py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 md:px-6 py-2 md:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg md:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25"
            >
              {loading ? 'در حال ذخیره...' : (song ? 'ویرایش آهنگ' : 'افزودن آهنگ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}