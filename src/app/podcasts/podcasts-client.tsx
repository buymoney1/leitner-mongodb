'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Headphones, Play, Clock, Filter, Plus, Edit, Trash2, X } from 'lucide-react';

interface Podcast {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  coverUrl?: string;
  duration?: number;
  level: string;
  isPublished: boolean;
  vocabularies: {
    id: string;
    word: string;
    meaning: string;
    timestamp?: number;
  }[];
  createdAt: string;
}

interface PodcastFormData {
  title: string;
  description: string;
  audioUrl: string;
  coverUrl: string;
  duration: string;
  level: string;
  isPublished: boolean;
  vocabularies: { word: string; meaning: string; timestamp: string }[];
}

export default function PodcastsClient() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [saving, setSaving] = useState(false);

  const levels = [
    { value: '', label: 'همه سطوح' },
    { value: 'A1', label: 'A1 - مبتدی' },
    { value: 'A2', label: 'A2 - مقدماتی' },
    { value: 'B1', label: 'B1 - متوسط' },
    { value: 'B2', label: 'B2 - بالاتر از متوسط' },
    { value: 'C1', label: 'C1 - پیشرفته' },
    { value: 'C2', label: 'C2 - کاملاً مسلط' }
  ];

  useEffect(() => {
    fetchPodcasts();
  }, [selectedLevel]);

  const fetchPodcasts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedLevel) params.append('level', selectedLevel);
      
      const response = await fetch(`/api/podcasts?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setPodcasts(data.podcasts || []);
      }
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePodcast = async (formData: PodcastFormData) => {
    setSaving(true);
    try {
      const url = editingPodcast 
        ? `/api/admin/podcasts/${editingPodcast.id}`
        : '/api/admin/podcasts';
      
      const method = editingPodcast ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : null,
          vocabularies: formData.vocabularies.filter(v => v.word.trim() && v.meaning.trim())
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        setEditingPodcast(null);
        fetchPodcasts(); // Refresh the list
      } else {
        alert(result.error || 'خطایی در ذخیره پادکست رخ داد.');
      }
    } catch (error) {
      console.error('Error saving podcast:', error);
      alert('خطا در ارتباط با سرور.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePodcast = async (id: string) => {
    if (!confirm('آیا از حذف این پادکست مطمئن هستید؟')) return;

    try {
      const response = await fetch(`/api/admin/podcasts/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        fetchPodcasts(); // Refresh the list
      } else {
        alert(result.error || 'خطایی در حذف پادکست رخ داد.');
      }
    } catch (error) {
      console.error('Error deleting podcast:', error);
      alert('خطا در ارتباط با سرور.');
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800/50 rounded-2xl p-6 h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 p-8">
      <div className="max-w-6xl mx-auto">
 

        {/* Admin Controls */}
        {isAdmin && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              <Plus className="h-5 w-5" />
              افزودن پادکست جدید
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-2xl border border-gray-300 dark:border-gray-700/50">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {levels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Podcasts Grid */}
        <div className="mb-15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map(podcast => (
            <div 
              key={podcast.id}
              className="bg-white dark:bg-gray-800/50 rounded-2xl p-3 border border-gray-300 dark:border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-500/10"
            >
              {/* Cover Image */}
              {podcast.coverUrl && (
                <div className="mb-4 relative">
                  <img 
                    src={podcast.coverUrl} 
                    alt={podcast.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setCurrentPlaying(currentPlaying === podcast.id ? null : podcast.id)}
                    className="absolute bottom-4 left-4 p-3 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg transition-all duration-300"
                  >
                    <Play className="h-5 w-5 text-white fill-current" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="space-y-3 ">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full text-sm border border-purple-500/30">
                    {podcast.level}
                  </span>
                  {podcast.duration && (
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                      <Clock className="h-4 w-4" />
                      {formatDuration(podcast.duration)}
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight">
                  {podcast.title}
                </h3>

                {podcast.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {podcast.description}
                  </p>
                )}



                {/* Admin Actions */}
                {isAdmin && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-300 dark:border-gray-700/50">
                    <button
                      onClick={() => setEditingPodcast(podcast)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-blue-500/30"
                    >
                      <Edit className="h-4 w-4" />
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDeletePodcast(podcast.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-500/30"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </button>
                  </div>
                )}
              </div>

              {/* Audio Player */}
              {currentPlaying === podcast.id && (
                <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-700/50">
                  <audio 
                    controls 
                    className="w-full"
                    onEnded={() => setCurrentPlaying(null)}
                  >
                    <source src={podcast.audioUrl} type="audio/mpeg" />
                    مرورگر شما از پخش کننده صدا پشتیبانی نمی‌کند.
                  </audio>
                </div>
              )}
            </div>
          ))}
        </div>

        {podcasts.length === 0 && (
          <div className="text-center py-12">
            <Headphones className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">پادکستی یافت نشد</h3>
            <p className="text-gray-400 dark:text-gray-500">هیچ پادکستی برای سطح انتخابی شما موجود نیست.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingPodcast) && (
        <PodcastModal
          podcast={editingPodcast}
          onClose={() => {
            setShowAddModal(false);
            setEditingPodcast(null);
          }}
          onSave={handleSavePodcast}
          loading={saving}
        />
      )}
    </div>
  );
}

// Modal Component
interface PodcastModalProps {
  podcast?: Podcast | null;
  onClose: () => void;
  onSave: (data: PodcastFormData) => void;
  loading?: boolean;
}

function PodcastModal({ podcast, onClose, onSave, loading = false }: PodcastModalProps) {
  const [formData, setFormData] = useState<PodcastFormData>({
    title: '',
    description: '',
    audioUrl: '',
    coverUrl: '',
    duration: '',
    level: 'A1',
    isPublished: false,
    vocabularies: [{ word: '', meaning: '', timestamp: '' }]
  });

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  useEffect(() => {
    if (podcast) {
      setFormData({
        title: podcast.title,
        description: podcast.description || '',
        audioUrl: podcast.audioUrl,
        coverUrl: podcast.coverUrl || '',
        duration: podcast.duration?.toString() || '',
        level: podcast.level,
        isPublished: podcast.isPublished,
        vocabularies: podcast.vocabularies.length > 0 
          ? podcast.vocabularies.map(v => ({
              word: v.word,
              meaning: v.meaning,
              timestamp: v.timestamp?.toString() || ''
            }))
          : [{ word: '', meaning: '', timestamp: '' }]
      });
    }
  }, [podcast]);

  const handleVocabularyChange = (index: number, field: string, value: string) => {
    const updatedVocabularies = [...formData.vocabularies];
    updatedVocabularies[index] = { ...updatedVocabularies[index], [field]: value };
    setFormData({ ...formData, vocabularies: updatedVocabularies });
  };

  const addVocabulary = () => {
    setFormData({
      ...formData,
      vocabularies: [...formData.vocabularies, { word: '', meaning: '', timestamp: '' }]
    });
  };

  const removeVocabulary = (index: number) => {
    const updatedVocabularies = formData.vocabularies.filter((_, i) => i !== index);
    setFormData({ ...formData, vocabularies: updatedVocabularies });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="mb-15 fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {podcast ? 'ویرایش پادکست' : 'افزودن پادکست جدید'}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* فیلدهای اصلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان پادکست *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                سطح *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              لینک فایل صوتی *
            </label>
            <input
              type="url"
              required
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              لینک تصویر
            </label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                مدت زمان (ثانیه)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="sr-only"
                />
                <div className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.isPublished ? 'bg-purple-500' : 'bg-gray-400 dark:bg-gray-600'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                    formData.isPublished ? 'transform translate-x-5 bg-white' : 'bg-gray-200 dark:bg-gray-300'
                  }`} />
                </div>
                <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">منتشر شده</span>
              </label>
            </div>
          </div>

          {/* لغات */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                لغات و معانی
              </label>
              <button
                type="button"
                onClick={addVocabulary}
                className="flex items-center gap-1 px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm text-white transition-colors"
              >
                <Plus className="h-4 w-4" />
                افزودن لغت
              </button>
            </div>

            <div className="space-y-3">
              {formData.vocabularies.map((vocab, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="لغت"
                    value={vocab.word}
                    onChange={(e) => handleVocabularyChange(index, 'word', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="معنی"
                    value={vocab.meaning}
                    onChange={(e) => handleVocabularyChange(index, 'meaning', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
    
                  {formData.vocabularies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVocabulary(index)}
                      className="p-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-300 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={loading}
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ذخیره...' : (podcast ? 'ویرایش پادکست' : 'افزودن پادکست')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}