'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface PodcastModalProps {
  podcast?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function PodcastModal({ podcast, onClose, onSave }: PodcastModalProps) {
  const [formData, setFormData] = useState({
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
          ? podcast.vocabularies.map((v: any) => ({
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {podcast ? 'ویرایش پادکست' : 'افزودن پادکست جدید'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* فیلدهای اصلی */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                عنوان پادکست *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                سطح *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              لینک فایل صوتی *
            </label>
            <input
              type="url"
              required
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              لینک تصویر
            </label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              توضیحات
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                مدت زمان (ثانیه)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  formData.isPublished ? 'bg-purple-500' : 'bg-gray-600'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${
                    formData.isPublished ? 'transform translate-x-5 bg-white' : 'bg-gray-300'
                  }`} />
                </div>
                <span className="mr-3 text-sm text-gray-300">منتشر شده</span>
              </label>
            </div>
          </div>

          {/* لغات */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                لغات و معانی
              </label>
              <button
                type="button"
                onClick={addVocabulary}
                className="flex items-center gap-1 px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm transition-colors"
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
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="معنی"
                    value={vocab.meaning}
                    onChange={(e) => handleVocabularyChange(index, 'meaning', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="زمان (ثانیه)"
                    value={vocab.timestamp}
                    onChange={(e) => handleVocabularyChange(index, 'timestamp', e.target.value)}
                    className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {formData.vocabularies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVocabulary(index)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              {podcast ? 'ویرایش پادکست' : 'افزودن پادکست'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}