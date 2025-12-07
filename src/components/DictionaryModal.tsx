// app/components/DictionaryModal.tsx
'use client';

import { X, Search, Plus, RotateCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
  initialMeaning?: string; // اضافه کردن prop جدید
  onAddToFlashcards: (word: string, meaning: string) => Promise<void>;
}

// کامپوننت DictionarySection داخلی
const DictionarySection = ({ word, onWordSelect }: { word: string; onWordSelect: (word: string) => void }) => {
  const [dictionaryData, setDictionaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (word.trim() && word.length > 2) {
      fetchDictionaryData(word);
    } else {
      setDictionaryData(null);
    }
  }, [word]);

  const fetchDictionaryData = async (searchWord: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${searchWord.toLowerCase()}`);
      
      if (response.ok) {
        const data = await response.json();
        setDictionaryData(data[0]);
      } else {
        setDictionaryData(null);
      }
    } catch (error) {
      console.error("Dictionary API error:", error);
      setDictionaryData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!word.trim() || word.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          کلمه‌ای با حداقل ۳ حرف وارد کنید
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
          <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div>
          <h3 className="text-gray-900 dark:text-white font-bold text-xl">اطلاعات دیکشنری</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">اطلاعات کامل کلمه از دیکشنری آنلاین</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-cyan-600 dark:text-cyan-400 text-lg font-medium">در حال دریافت اطلاعات دیکشنری...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">لطفاً چند لحظه صبر کنید</p>
        </div>
      ) : dictionaryData ? (
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{dictionaryData.word}</h2>
                {dictionaryData.phonetic && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">تلفظ:</span>
                    <span className="text-cyan-600 dark:text-cyan-400 font-mono text-lg">/{dictionaryData.phonetic}/</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {dictionaryData.meanings?.slice(0, 2).map((meaning: any, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-md"
                  >
                    {meaning.partOfSpeech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* معانی و تعاریف */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white border-r-4 border-cyan-500 pr-3">معانی و تعاریف</h3>
            
            {dictionaryData.meanings?.slice(0, 4).map((meaning: any, meaningIndex: number) => (
              <div key={meaningIndex} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                      {meaningIndex + 1}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-lg text-sm font-medium">
                    {meaning.partOfSpeech}
                  </span>
                </div>
                
                <ul className="space-y-4">
                  {meaning.definitions?.slice(0, 3).map((def: any, defIndex: number) => (
                    <li key={defIndex} className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-1">
                          <span className="text-green-600 dark:text-green-400 text-xs">•</span>
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                            {def.definition}
                          </p>
                          
                          {/* مثال */}
                          {def.example && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-r-2 border-purple-500">
                              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-1">مثال:</p>
                              <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{def.example}"</p>
                            </div>
                          )}
                          
                          {/* مترادف‌ها */}
                          {def.synonyms && def.synonyms.length > 0 && (
                            <div className="mt-3">
                              <p className="text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-2">مترادف‌ها:</p>
                              <div className="flex flex-wrap gap-2">
                                {def.synonyms.slice(0, 5).map((synonym: string, index: number) => (
                                  <button
                                    key={index}
                                    onClick={() => onWordSelect(synonym)}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors active:scale-95"
                                  >
                                    {synonym}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* مترادف‌ها و متضادها */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* مترادف‌ها */}
            {dictionaryData.meanings?.[0]?.synonyms && dictionaryData.meanings[0].synonyms.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">مترادف‌ها</h4>
                <div className="flex flex-wrap gap-2">
                  {dictionaryData.meanings[0].synonyms.slice(0, 8).map((synonym: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => onWordSelect(synonym)}
                      className="px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 text-green-700 dark:text-green-300 rounded-lg text-sm hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-900/20 transition-all active:scale-95"
                    >
                      {synonym}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* متضادها */}
            {dictionaryData.meanings?.[0]?.antonyms && dictionaryData.meanings[0].antonyms.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">متضادها</h4>
                <div className="flex flex-wrap gap-2">
                  {dictionaryData.meanings[0].antonyms.slice(0, 8).map((antonym: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => onWordSelect(antonym)}
                      className="px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 text-red-700 dark:text-red-300 rounded-lg text-sm hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-900/20 transition-all active:scale-95"
                    >
                      {antonym}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">اطلاعاتی یافت نشد</h3>
          <p className="text-gray-400 dark:text-gray-500 text-base">
            متأسفانه اطلاعاتی برای کلمه "{word}" در دیکشنری موجود نیست
          </p>
        </div>
      )}
    </div>
  );
};

export default function DictionaryModal({ 
  isOpen, 
  onClose, 
  initialWord = "",
  initialMeaning = "", 
  onAddToFlashcards 
}: DictionaryModalProps) {
  const [customWord, setCustomWord] = useState(initialWord);
  const [customMeaning, setCustomMeaning] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (isOpen && initialWord) {
      setCustomWord(initialWord);
      // اگر معنی اولیه وجود داشت از آن استفاده کن، در غیر این صورت ترجمه خودکار
      if (initialMeaning) {
        setCustomMeaning(initialMeaning);
      } else {
        autoTranslateWord(initialWord);
      }
    }
  }, [isOpen, initialWord, initialMeaning]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // تابع برای ترجمه خودکار کلمه
  const autoTranslateWord = async (word: string) => {
    if (!word.trim()) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch(`/api/translate?text=${encodeURIComponent(word)}&target=fa`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomMeaning(data.translatedText || "");
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // تابع برای انتخاب کلمه از مترادف‌ها
  const handleWordSelect = (word: string) => {
    setCustomWord(word);
    autoTranslateWord(word);
  };

  // تابع برای ترجمه دستی
  const handleManualTranslate = async () => {
    if (customWord.trim()) {
      await autoTranslateWord(customWord.trim());
    }
  };

  // تابع برای افزودن کارت
  const handleAddToFlashcards = async () => {
    if (!customWord.trim() || !customMeaning.trim()) {
      alert("لطفاً هم کلمه و هم معنی را وارد کنید.");
      return;
    }

    setIsAddingCard(true);
    try {
      await onAddToFlashcards(customWord.trim(), customMeaning.trim());
      
      // بستن مودال بعد از موفقیت
      onClose();
      setCustomWord("");
      setCustomMeaning("");
    } catch (error) {
      console.error("Error adding flashcard:", error);
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleClose = () => {
    setCustomWord("");
    setCustomMeaning("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div 
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* هدر مودال */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
                <span className="hidden sm:inline">بستن</span>
              </button>
              
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white text-center">
                دیکشنری و افزودن فلش‌کارت
              </h2>
              
              <div className="w-10"></div> {/* برای بالانس کردن */}
            </div>
          </div>

          {/* محتوای اصلی مودال */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              {/* فرم افزودن کارت */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 mb-6 border border-cyan-100 dark:border-cyan-900/30">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <Plus className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  افزودن به فلش‌کارت
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <label className="block text-gray-900 dark:text-white text-sm font-medium">
                      کلمه انگلیسی
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customWord}
                        onChange={(e) => setCustomWord(e.target.value)}
                        placeholder="مثال: learn"
                        className="pl-8 w-full p-4 pr-12 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors text-lg"
                        dir="ltr"
                      />
                      {customWord && (
                        <button
                          onClick={() => setCustomWord("")}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-gray-900 dark:text-white text-sm font-medium">
                        معنی فارسی
                      </label>
                      <button
                        onClick={handleManualTranslate}
                        disabled={isTranslating || !customWord.trim()}
                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 text-sm flex items-center gap-2 disabled:opacity-50 px-3 py-1 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                      >
                        {isTranslating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            در حال ترجمه...
                          </>
                        ) : (
                          <>
                            <RotateCw className="w-4 h-4" />
                            ترجمه خودکار
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={customMeaning}
                        onChange={(e) => setCustomMeaning(e.target.value)}
                        placeholder={isTranslating ? "در حال ترجمه..." : "مثال: یاد گرفتن"}
                        className="w-full p-4 pr-12 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors text-lg"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddToFlashcards()}
                        disabled={isTranslating}
                      />
                      {customMeaning && (
                        <button
                          onClick={() => setCustomMeaning("")}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {isTranslating && (
                      <div className="text-cyan-600 dark:text-cyan-400 text-sm flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        در حال دریافت ترجمه از سرور...
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={handleAddToFlashcards}
                  disabled={isAddingCard || !customWord.trim() || !customMeaning.trim()}
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                    isAddingCard || !customWord.trim() || !customMeaning.trim()
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
                  }`}
                >
                  {isAddingCard ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      در حال افزودن...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      افزودن به فلش‌کارت‌ها
                    </>
                  )}
                </button>
              </div>

              {/* بخش دیکشنری */}
              <DictionarySection word={customWord} onWordSelect={handleWordSelect} />
            </div>
          </div>

          {/* فوتر مودال */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>دیکشنری آنلاین</span>
              </div>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* استایل‌های سفارشی */}
      <style jsx>{`
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .fixed.inset-0.z-\[9999\] > div {
          animation: modalAppear 0.3s ease-out;
        }

        /* Custom scrollbar for modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
          margin: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }

        @media (prefers-color-scheme: dark) {
          .overflow-y-auto::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
        }
      `}</style>
    </>
  );
}