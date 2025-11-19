'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileText, Clock, Filter, Plus, Edit, Trash2, X, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverUrl?: string;
  level: string;
  readingTime?: number;
  isPublished: boolean;
  vocabularies: {
    id: string;
    word: string;
    meaning: string;
    paragraph?: number;
  }[];
  createdAt: string;
}

interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  coverUrl: string;
  level: string;
  readingTime: string;
  isPublished: boolean;
  vocabularies: { word: string; meaning: string; paragraph: string }[];
}

export default function ArticlesClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userWithRole = session?.user as any;
  const isAdmin = userWithRole?.role === 'admin';
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
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
    fetchArticles();
  }, [selectedLevel]);

  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedLevel) params.append('level', selectedLevel);
      
      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveArticle = async (formData: ArticleFormData) => {
    setSaving(true);
    try {
      const url = editingArticle 
        ? `/api/admin/articles/${editingArticle.id}`
        : '/api/admin/articles';
      
      const method = editingArticle ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          readingTime: formData.readingTime ? parseInt(formData.readingTime) : null,
          vocabularies: formData.vocabularies.filter(v => v.word.trim() && v.meaning.trim())
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        setEditingArticle(null);
        fetchArticles(); // Refresh the list
      } else {
        alert(result.error || 'خطایی در ذخیره مقاله رخ داد.');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('خطا در ارتباط با سرور.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('آیا از حذف این مقاله مطمئن هستید؟')) return;

    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        fetchArticles(); // Refresh the list
      } else {
        alert(result.error || 'خطایی در حذف مقاله رخ داد.');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('خطا در ارتباط با سرور.');
    }
  };

  // تابع برای مدیریت کلیک روی کارت
  const handleCardClick = (articleId: string) => {
    router.push(`/articles/${articleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800/50 rounded-2xl p-6 h-80"></div>
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
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25"
            >
              <Plus className="h-5 w-5" />
              افزودن مقاله جدید
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-2xl border border-gray-300 dark:border-gray-700/50">
          <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <select 
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            {levels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map(article => (
            <div 
              key={article.id}
              className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-green-500/10 group cursor-pointer"
              onClick={() => handleCardClick(article.id)}
            >
              <div className="p-6">
                {/* Cover Image */}
                {article.coverUrl && (
                  <div className="mb-4">
                    <img 
                      src={article.coverUrl} 
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm border border-green-500/30">
                      {article.level}
                    </span>
                    {article.readingTime && (
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Clock className="h-4 w-4" />
                        {article.readingTime} دقیقه
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {article.vocabularies.length} لغت جدید
                    </span>
                    <div className="flex items-center gap-1 text-green-500 dark:text-green-400 text-sm font-medium">
                      مطالعه مقاله
                      <BookOpen className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div 
                      className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-300 dark:border-gray-700/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setEditingArticle(article)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors border border-blue-500/30"
                      >
                        <Edit className="h-4 w-4" />
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded-lg transition-colors border border-red-500/30"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">مقاله‌ای یافت نشد</h3>
            <p className="text-gray-400 dark:text-gray-500">هیچ مقاله‌ای برای سطح انتخابی شما موجود نیست.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingArticle) && (
        <ArticleModal
          article={editingArticle}
          onClose={() => {
            setShowAddModal(false);
            setEditingArticle(null);
          }}
          onSave={handleSaveArticle}
          loading={saving}
        />
      )}
    </div>
  );
}

// Modal Component
interface ArticleModalProps {
  article?: Article | null;
  onClose: () => void;
  onSave: (data: ArticleFormData) => void;
  loading?: boolean;
}

function ArticleModal({ article, onClose, onSave, loading = false }: ArticleModalProps) {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    excerpt: '',
    coverUrl: '',
    level: 'A1',
    readingTime: '',
    isPublished: false,
    vocabularies: [{ word: '', meaning: '', paragraph: '' }]
  });

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        coverUrl: article.coverUrl || '',
        level: article.level,
        readingTime: article.readingTime?.toString() || '',
        isPublished: article.isPublished,
        vocabularies: article.vocabularies.length > 0 
          ? article.vocabularies.map(v => ({
              word: v.word,
              meaning: v.meaning,
              paragraph: v.paragraph?.toString() || ''
            }))
          : [{ word: '', meaning: '', paragraph: '' }]
      });
    }
  }, [article]);

  const handleVocabularyChange = (index: number, field: string, value: string) => {
    const updatedVocabularies = [...formData.vocabularies];
    updatedVocabularies[index] = { ...updatedVocabularies[index], [field]: value };
    setFormData({ ...formData, vocabularies: updatedVocabularies });
  };

  const addVocabulary = () => {
    setFormData({
      ...formData,
      vocabularies: [...formData.vocabularies, { word: '', meaning: '', paragraph: '' }]
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
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {article ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}
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
                عنوان مقاله *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                سطح *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              لینک تصویر
            </label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              خلاصه مقاله
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="خلاصه کوتاه از مقاله..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              محتوای مقاله *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="متن کامل مقاله را اینجا بنویسید..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                زمان مطالعه (دقیقه)
              </label>
              <input
                type="number"
                value={formData.readingTime}
                onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                  formData.isPublished ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
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
                className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 rounded-lg text-sm text-white transition-colors"
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
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="معنی"
                    value={vocab.meaning}
                    onChange={(e) => handleVocabularyChange(index, 'meaning', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="پاراگراف"
                    value={vocab.paragraph}
                    onChange={(e) => handleVocabularyChange(index, 'paragraph', e.target.value)}
                    className="w-24 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال ذخیره...' : (article ? 'ویرایش مقاله' : 'افزودن مقاله')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}