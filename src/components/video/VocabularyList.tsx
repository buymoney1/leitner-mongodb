// components/video/VocabularyList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Search, BookOpen, Sparkles, Plus } from 'lucide-react';
import DictionaryModal from '../DictionaryModal';

// Type برای لغات ویدیو - مطابق با مدل Prisma
interface VideoVocabulary {
  id: string;
  word: string;
  meaning: string;
  timestamp?: number;
}

export default function VocabularyList() {
  const params = useParams();
  const videoId = params.id as string;
  
  const [vocabularies, setVocabularies] = useState<VideoVocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWord, setSelectedWord] = useState<VideoVocabulary | null>(null);
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  const [selectedWordForModal, setSelectedWordForModal] = useState("");
  const [selectedWordMeaning, setSelectedWordMeaning] = useState("");

  // Fetch vocabularies from API
  useEffect(() => {
    if (!videoId) {
      console.error('videoId is empty from params:', params);
      setLoading(false);
      return;
    }

    const fetchVocabularies = async () => {
      try {
        setLoading(true);
        console.log('Fetching vocabularies for video:', videoId);
        const response = await fetch(`/api/videos/${videoId}/vocabularies`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`خطا در دریافت لغات: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        
        // اطمینان از ساختار داده
        if (data && data.vocabularies && Array.isArray(data.vocabularies)) {
          setVocabularies(data.vocabularies);
          console.log('Vocabularies set:', data.vocabularies.length, 'items');
        } else {
          console.warn('Invalid data structure:', data);
          setVocabularies([]);
        }
      } catch (error) {
        console.error('Error fetching vocabularies:', error);
        alert('خطا در بارگذاری لغات. لطفاً صفحه را رفرش کنید.');
      } finally {
        setLoading(false);
      }
    };

    fetchVocabularies();
  }, [videoId, params]);

  // تابع برای افزودن کارت به فلش‌کارت
  const handleAddToFlashcards = async (word: string, meaning: string) => {
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          front: word.trim(), 
          back: meaning.trim() 
        }),
      });

      if (response.ok) {
        alert("لغت با موفقیت به فلش‌کارت‌ها اضافه شد!");
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن لغت.");
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور.");
      return Promise.reject(error);
    }
  };

  // فیلتر لغات بر اساس جستجو
  const filteredVocabularies = vocabularies.filter(vocab =>
    vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // باز کردن مودال برای لغت انتخابی
  const handleWordClick = (vocab: VideoVocabulary) => {
    console.log('Word clicked:', vocab);
    setSelectedWord(vocab);
    setSelectedWordForModal(vocab.word);
    setSelectedWordMeaning(vocab.meaning);
    setIsDictionaryModalOpen(true);
  };

  // باز کردن مودال با دکمه + (برای جلوگیری از bubbling event)
  const handleAddButtonClick = (e: React.MouseEvent, vocab: VideoVocabulary) => {
    e.stopPropagation();
    console.log('Add button clicked for:', vocab);
    setSelectedWord(vocab);
    setSelectedWordForModal(vocab.word);
    setSelectedWordMeaning(vocab.meaning);
    setIsDictionaryModalOpen(true);
  };

  // نمایش loading state
  if (!videoId) {
    return (
      <div className="min-h-full bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium">خطا: شناسه ویدیو نامعتبر است</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            لطفاً از صفحه ویدیو دوباره وارد شوید
          </p>
          <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
            Params: {JSON.stringify(params)}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-full bg-white dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری لغات...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering with vocabularies:', vocabularies.length);
  console.log('Filtered vocabularies:', filteredVocabularies.length);

  return (
    <div className="min-h-full bg-white dark:bg-gray-900 transition-colors duration-300 p-4">
      {/* مودال دیکشنری */}
      <DictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => {
          setIsDictionaryModalOpen(false);
          setSelectedWord(null);
          setSelectedWordForModal("");
          setSelectedWordMeaning("");
        }}
        initialWord={selectedWordForModal}
        initialMeaning={selectedWordMeaning}
        onAddToFlashcards={handleAddToFlashcards}
      />

      {/* هدر و اطلاعات */}
      <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لغات ویدیو</h2>
        
          <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-2 py-1 rounded-full">
            {vocabularies.length} لغت
          </span>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
        <div className="relative bg-white dark:bg-gray-900/80 rounded-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-xl">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-500 dark:text-cyan-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجوی لغت یا معنی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pr-12 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none rounded-2xl"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
              {filteredVocabularies.length} نتیجه
            </span>
          </div>
        </div>
      </div>

      {/* Vocabulary List */}
      <div className="space-y-3 mb-10">
        {vocabularies.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm">
              <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-500 text-lg mb-2">هنوز لغتی برای این ویدیو ثبت نشده است</p>
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                مدیر سیستم هنوز لغاتی برای این ویدیو اضافه نکرده است
              </p>
            </div>
          </div>
        ) : filteredVocabularies.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm">
              <Search className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-500 text-lg mb-2">لغتی یافت نشد</p>
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                با معیارهای جستجوی شما هیچ لغتی مطابقت ندارد
              </p>
            </div>
          </div>
        ) : (
          filteredVocabularies.map((vocab) => (
            <div
              key={vocab.id}
              onClick={() => handleWordClick(vocab)}
              className={`px-4 py-3 rounded-2xl border backdrop-blur-sm transition-all duration-300 cursor-pointer group relative overflow-hidden
                ${selectedWord?.id === vocab.id
                  ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 transform scale-105'
                  : 'bg-gray-100/50 dark:bg-gray-800/30 border-gray-300 dark:border-gray-700/50 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-600/50 hover:shadow-lg'
                }`}
            >
              {/* Background Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                selectedWord?.id === vocab.id ? 'opacity-100' : ''
              }`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <p className={`font-bold text-lg tracking-wide ${
                          selectedWord?.id === vocab.id 
                            ? 'text-cyan-600 dark:text-cyan-300' 
                            : 'text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-200'
                        }`}>
                          {vocab.word}
                        </p>
                     
                      </div>
                      <button 
                        onClick={(e) => handleAddButtonClick(e, vocab)}
                        className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-800/50 transition-colors"
                        title="افزودن به فلش‌کارت"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Word Meaning */}
                    <div className="mt-2">
                    <p className={`text-base leading-relaxed ${
                        selectedWord?.id === vocab.id 
                          ? 'text-gray-800 dark:text-gray-100 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {vocab.meaning}
                      </p>
                    </div>
                    
                  </div>
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 ${
                selectedWord?.id === vocab.id ? 'opacity-100' : ''
              }`}>
                <div className="absolute inset-[2px] rounded-2xl bg-white dark:bg-gray-900"></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="mb-10 text-center text-sm text-gray-500 dark:text-gray-400 mt-8 pb-4">
        <div className="bg-gray-100/50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" />
            <p className="font-medium">راهنمای استفاده</p>
          </div>
          <p className="text-xs leading-relaxed">
            ۱. روی هر لغت کلیک کنید تا اطلاعات کامل آن را ببینید<br />
            ۲. از دکمه <span className="text-cyan-600 dark:text-cyan-400">+</span> برای افزودن به فلش‌کارت استفاده کنید<br />
            ۳. در قسمت جستجو، هم کلمه انگلیسی و هم معنی فارسی قابل جستجو است
          </p>
        </div>
      </div>


    </div>
  );
}