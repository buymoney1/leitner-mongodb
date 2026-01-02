// components/video/QuickWordDialog.tsx
'use client';

import { X, PlusCircle, Eye, Sparkles, BookOpen, Loader2, Globe, AlertCircle, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface QuickWordDialogProps {
  isOpen: boolean;
  word: string;
  meaning?: string;
  onClose: () => void;
  onAddToLeitner: (word: string, meaning: string) => Promise<void>;
  onViewDetails: () => void;
}

interface TranslationResponse {
  translatedText: string;
}

export default function QuickWordDialog({
  isOpen,
  word,
  meaning = '',
  onClose,
  onAddToLeitner,
  onViewDetails
}: QuickWordDialogProps) {
  const [customMeaning, setCustomMeaning] = useState(meaning);
  const [translating, setTranslating] = useState(false);
  const [autoTranslated, setAutoTranslated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [translationTime, setTranslationTime] = useState(5);
  const [isManualEdit, setIsManualEdit] = useState(false);
  const [addingToFlashcards, setAddingToFlashcards] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen && word) {
      setCustomMeaning(meaning || '');
      setAutoTranslated(false);
      setError(null);
      setSuccess(false);
      setTranslationTime(5);
      setIsManualEdit(false);
      setAddingToFlashcards(false);

      // شروع ترجمه خودکار فقط اگر معنی موجود نباشد
      if (!meaning.trim()) {
        startAutoTranslation();
      } else {
        setAutoTranslated(true);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [isOpen, word, meaning]);

  const startAutoTranslation = async () => {
    setTranslating(true);
    setError(null);
    setSuccess(false);
    
    // شمارش معکوس 5 ثانیه
    let timeLeft = 5;
    setTranslationTime(timeLeft);
    
    const countdownInterval = setInterval(() => {
      timeLeft -= 1;
      setTranslationTime(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    try {
      // ترجمه با استفاده از API موجود
      const translation = await fetchTranslation(word);
      
      clearInterval(countdownInterval);
      setTranslationTime(0);
      
      if (translation && translation.translatedText && translation.translatedText !== word) {
        setCustomMeaning(translation.translatedText);
        setAutoTranslated(true);
        setSuccess(true);
        
        // نمایش موفقیت برای 2 ثانیه
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError('ترجمه خودکار ناموفق بود. لطفاً معنی را دستی وارد کنید.');
        setAutoTranslated(false);
      }
    } catch (err) {
      console.error('Translation error:', err);
      clearInterval(countdownInterval);
      setTranslationTime(0);
      setError('خطا در اتصال به سرویس ترجمه. لطفاً معنی را دستی وارد کنید.');
      setAutoTranslated(false);
    } finally {
      setTranslating(false);
    }
  };

  const fetchTranslation = async (text: string): Promise<TranslationResponse> => {
    try {
      const response = await fetch(`/api/translate?text=${encodeURIComponent(text)}&target=fa`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // بررسی ساختار پاسخ
      if (data.translatedText && data.translatedText.trim()) {
        return { translatedText: data.translatedText };
      }
      
      throw new Error('No translation found');
    } catch (error) {
      console.error('Translation API error:', error);
      
      // در صورت خطا، سعی می‌کنیم از دیکشنری API استفاده کنیم
      try {
        const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
        
        if (dictResponse.ok) {
          const dictData = await dictResponse.json();
          if (dictData[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
            return { 
              translatedText: dictData[0].meanings[0].definitions[0].definition 
            };
          }
        }
      } catch (dictError) {
        console.error('Dictionary API error:', dictError);
      }
      
      // اگر هیچ کدام جواب نداد، متن اصلی را برمی‌گردانیم
      return { translatedText: text };
    }
  };

  const handleAddToFlashcards = async (word: string, meaning: string) => {
    const loadingToast = toast.loading('در حال افزودن به فلش‌کارت...');
    
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
        toast.success(`کلمه "${word}" با موفقیت به فلش‌کارت‌ها اضافه شد!`, {
          id: loadingToast,
          duration: 3000,
        });
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن کارت.");
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور', {
        id: loadingToast,
        duration: 3000,
      });
      return Promise.reject(error);
    }
  };

  const handleAddToLeitner = async () => {
    if (customMeaning.trim()) {
      setAddingToFlashcards(true);
      try {
        // استفاده از API جدید
        await handleAddToFlashcards(word, customMeaning);
        
        // بستن دیالوگ بعد از موفقیت
        setTimeout(() => {
          onClose();
        }, 500); // تأخیر کوتاه برای نمایش موفقیت
        
      } catch (error) {
        setError('خطا در ذخیره لغت. لطفاً دوباره تلاش کنید.');
      } finally {
        setAddingToFlashcards(false);
      }
    }
  };

  const handleRetryTranslation = () => {
    // پاک کردن تایمرهای قبلی
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }
    
    // ریست کردن حالت‌ها
    setCustomMeaning('');
    setError(null);
    setSuccess(false);
    setIsManualEdit(false);
    
    // شروع ترجمه مجدد
    startAutoTranslation();
  };

  const handleManualEdit = () => {
    setIsManualEdit(true);
    setAutoTranslated(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        {/* Main Dialog */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-300 dark:border-gray-700">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">کلمه جدید</h3>
          
            </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              disabled={translating || addingToFlashcards}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Word Display */}
            <div className="text-center">
              <div className="mb-4">
             
               <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                  {word}
                </div>
              </div>
              
              {/* Translation Status */}
              <div className="mb-4">
                {translating ? (
                  <div className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                    <div className="relative">
                      <Loader2 className="w-6 h-6 text-blue-500 dark:text-blue-400 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
                          {translationTime}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        در حال ترجمه خودکار...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {translationTime} ثانیه تا پایان
                      </p>
                    </div>
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800/30">
                    <Check className="w-6 h-6 text-green-500 dark:text-green-400" />
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        ترجمه خودکار با موفقیت انجام شد
                      </p>
                      <button
                        onClick={handleManualEdit}
                        className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 underline mt-1"
                      >
                        ویرایش معنی
                      </button>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl border border-red-200 dark:border-red-800/30">
                    <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
                    <div className="text-right flex-1">
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                    <button
                      onClick={handleRetryTranslation}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                    >
                      تلاش مجدد
                    </button>
                  </div>
                ) : autoTranslated ? (
                  <div className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                    <Globe className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    <div className="text-right">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        ترجمه خودکار انجام شد
                      </p>
   
                    </div>
                  </div>
                ) : isManualEdit ? (
                  <div className="flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800/30">
                    <BookOpen className="w-6 h-6 text-amber-500 dark:text-amber-400" />
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        در حال ویرایش دستی
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        معنی را ویرایش کنید
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
              
              {/* Meaning Input */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    معنی فارسی
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {translating ? 'در حال ترجمه...' : 'قابل ویرایش'}
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    value={customMeaning}
                    onChange={(e) => {
                      setCustomMeaning(e.target.value);
                      if (!isManualEdit) setIsManualEdit(true);
                    }}
                    placeholder={
                      translating 
                        ? "در حال ترجمه خودکار، لطفاً منتظر بمانید..." 
                        : "معنی کلمه را وارد کنید یا صبر کنید تا ترجمه خودکار انجام شود..."
                    }
                    className="w-full p-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-gray-900 dark:text-white resize-none transition-all duration-300 min-h-[100px]"
                    rows={2}
                    disabled={translating}
                  />
                  {translating && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-blue-500 dark:text-blue-400 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">در حال ترجمه...</p>
                      </div>
                    </div>
                  )}
                </div>
                


              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleAddToLeitner}
                disabled={!customMeaning.trim() || translating || addingToFlashcards}
                className={`group flex items-center justify-center gap-3 w-full p-4 rounded-xl transition-all duration-300 shadow-lg ${
                  !customMeaning.trim() || translating || addingToFlashcards
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {addingToFlashcards ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
                <span className="font-medium text-lg">
                  {addingToFlashcards ? 'در حال افزودن...' : 'افزودن به فلش‌کارت'}
                </span>
              </button>

              <button
                onClick={onViewDetails}
                disabled={translating || addingToFlashcards}
                className="group flex items-center justify-center gap-3 w-full p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl transition-all duration-300 border-2 border-blue-200 dark:border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-300 dark:hover:border-blue-700"
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium text-lg">مشاهده جزئیات در دیکشنری</span>
              </button>
            </div>

            {/* Features Info */}
   
   
          </div>



        </div>
      </div>
    </div>
  );
}