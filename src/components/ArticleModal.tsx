'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, FileText, Clock, BookOpen } from 'lucide-react';

export interface Article {
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

export interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  coverUrl: string;
  level: string;
  readingTime: string;
  isPublished: boolean;
  vocabularies: { word: string; meaning: string; paragraph: string }[];
}

interface ArticleModalProps {
  article?: Article | null;
  onClose: () => void;
  onSave: (data: ArticleFormData) => void;
  loading?: boolean;
}

export default function ArticleModal({ article, onClose, onSave, loading = false }: ArticleModalProps) {
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

  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const levels = [
    { value: 'A1', label: 'A1 - مبتدی' },
    { value: 'A2', label: 'A2 - مقدماتی' },
    { value: 'B1', label: 'B1 - متوسط' },
    { value: 'B2', label: 'B2 - بالاتر از متوسط' },
    { value: 'C1', label: 'C1 - پیشرفته' },
    { value: 'C2', label: 'C2 - کاملاً مسلط' }
  ];

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

  useEffect(() => {
    // محاسبه تعداد کلمات
    const words = formData.content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // محاسبه خودکار زمان مطالعه اگر مقدار نداده باشد
    if (!formData.readingTime && formData.content) {
      const estimatedReadingTime = Math.ceil(words.length / 200); // فرض: 200 کلمه در دقیقه
      if (estimatedReadingTime > 0) {
        setFormData(prev => ({ ...prev, readingTime: estimatedReadingTime.toString() }));
      }
    }
  }, [formData.content, formData.readingTime]);

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
    if (formData.vocabularies.length > 1) {
      const updatedVocabularies = formData.vocabularies.filter((_, i) => i !== index);
      setFormData({ ...formData, vocabularies: updatedVocabularies });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // اعتبارسنجی پایه
    if (!formData.title.trim()) {
      alert('عنوان مقاله الزامی است.');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('محتوای مقاله الزامی است.');
      return;
    }

    if (formData.vocabularies.some(v => v.word.trim() && !v.meaning.trim())) {
      alert('برای لغاتی که وارد کرده‌اید، معنی نیز باید مشخص شود.');
      return;
    }

    onSave(formData);
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'A2': 'bg-green-500/20 text-green-400 border-green-500/30',
      'B1': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'B2': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'C1': 'bg-red-500/20 text-red-400 border-red-500/30',
      'C2': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const PreviewContent = () => (
    <div className="space-y-6">
      {/* هدر مقاله */}
      <div className="text-center border-b border-gray-700 pb-6">
        {formData.coverUrl && (
          <img 
            src={formData.coverUrl} 
            alt={formData.title}
            className="w-full h-64 object-cover rounded-2xl mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-white mb-4">{formData.title}</h1>
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <span className={`px-3 py-1 rounded-full text-sm border ${getLevelColor(formData.level)}`}>
            {levels.find(l => l.value === formData.level)?.label}
          </span>
          {formData.readingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>زمان مطالعه: {formData.readingTime} دقیقه</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{wordCount} کلمه</span>
          </div>
        </div>
      </div>

      {/* خلاصه */}
      {formData.excerpt && (
        <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
          <p className="text-gray-300 leading-relaxed italic">{formData.excerpt}</p>
        </div>
      )}

      {/* محتوا */}
      <div className="prose prose-invert max-w-none">
        <div className="text-gray-300 leading-8 text-justify whitespace-pre-line">
          {formData.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* لغات */}
      {formData.vocabularies.some(v => v.word.trim()) && (
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            لغات جدید
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formData.vocabularies
              .filter(v => v.word.trim())
              .map((vocab, index) => (
                <div key={index} className="bg-gray-700/30 rounded-lg p-3 border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-white text-lg">{vocab.word}</div>
                      <div className="text-gray-400 text-sm mt-1">{vocab.meaning}</div>
                    </div>
                    {vocab.paragraph && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                        پاراگراف {vocab.paragraph}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl border border-green-500/30">
              <FileText className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {article ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* دکمه‌های پیش‌نمایش/ویرایش */}
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              {previewMode ? (
                <>
                  <FileText className="h-4 w-4" />
                  حالت ویرایش
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  پیش‌نمایش
                </>
              )}
            </button>
            
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {previewMode ? (
          <div className="p-6">
            <PreviewContent />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* فیلدهای اصلی */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* اطلاعات اصلی */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-400" />
                    اطلاعات اصلی
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        عنوان مقاله *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="عنوان جذاب و توصیفی برای مقاله..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        سطح *
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {levels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        لینک تصویر
                      </label>
                      <input
                        type="url"
                        value={formData.coverUrl}
                        onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.coverUrl && (
                        <div className="mt-2">
                          <img 
                            src={formData.coverUrl} 
                            alt="Preview" 
                            className="h-20 object-cover rounded-lg border border-gray-600"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* تنظیمات انتشار */}
                <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-400" />
                    تنظیمات انتشار
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        زمان مطالعه (دقیقه)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.readingTime}
                        onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        تخمین زده شده: {Math.ceil(wordCount / 200)} دقیقه ({wordCount} کلمه)
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isPublished}
                          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                          className="sr-only"
                        />
                        <div className={`relative w-11 h-6 rounded-full transition-colors ${
                          formData.isPublished ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                            formData.isPublished ? 'transform translate-x-5 bg-white' : 'bg-gray-300'
                          }`} />
                        </div>
                        <span className="mr-3 text-sm text-gray-300">منتشر شده</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* خلاصه مقاله */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    خلاصه مقاله
                    <span className="text-gray-500 text-xs mr-2">(اختیاری)</span>
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="خلاصه کوتاه و جذاب از مقاله که در لیست مقالات نمایش داده می‌شود..."
                  />
                </div>

                {/* محتوای مقاله */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      محتوای مقاله *
                    </label>
                    <span className="text-xs text-gray-400">
                      {wordCount} کلمه
                    </span>
                  </div>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium leading-7 resize-none"
                    placeholder="متن کامل مقاله را اینجا بنویسید...
                    
می‌توانید از پاراگراف‌های مختلف استفاده کنید و ساختار مناسبی به مقاله بدهید.

سعی کنید محتوای آموزشی و مفیدی ارائه دهید که برای زبان‌آموزان در سطح انتخاب شده مناسب باشد."
                  />
                </div>
              </div>
            </div>

            {/* لغات */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-400" />
                  لغات و معانی
                  <span className="text-sm text-gray-400 font-normal">
                    (اختیاری - {formData.vocabularies.filter(v => v.word.trim()).length} لغت)
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={addVocabulary}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  افزودن لغت
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.vocabularies.map((vocab, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-600/50 rounded-lg border border-gray-500">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">لغت</label>
                        <input
                          type="text"
                          placeholder="مثلاً: beautiful"
                          value={vocab.word}
                          onChange={(e) => handleVocabularyChange(index, 'word', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">معنی</label>
                        <input
                          type="text"
                          placeholder="مثلاً: زیبا"
                          value={vocab.meaning}
                          onChange={(e) => handleVocabularyChange(index, 'meaning', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">پاراگراف</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="شماره پاراگراف"
                          value={vocab.paragraph}
                          onChange={(e) => handleVocabularyChange(index, 'paragraph', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVocabulary(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                      disabled={formData.vocabularies.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* دکمه‌های اقدام */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {formData.vocabularies.filter(v => v.word.trim()).length} لغت • 
                {wordCount} کلمه • 
                {formData.readingTime || '?'} دقیقه مطالعه
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      {article ? 'ویرایش مقاله' : 'افزودن مقاله'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}