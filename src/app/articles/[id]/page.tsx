// app/articles/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Clock, Bookmark, Share2, X } from 'lucide-react';

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

// کامپوننت DictionarySection (مشابه کامپوننت VideoPlayer)
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
    return null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-gray-300 dark:border-gray-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-gray-900 dark:text-white font-semibold">اطلاعات دیکشنری</h3>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-cyan-600 dark:text-cyan-400 text-sm mr-2">در حال دریافت اطلاعات...</span>
        </div>
      ) : dictionaryData ? (
        <div className="space-y-3">
          {/* تلفظ و نوع کلمه */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {dictionaryData.phonetic && (
                <span className="text-gray-600 dark:text-gray-400 text-sm">/{dictionaryData.phonetic}/</span>
              )}
            </div>
            <div className="flex gap-2">
              {dictionaryData.meanings?.slice(0, 2).map((meaning: any, index: number) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-lg text-xs"
                >
                  {meaning.partOfSpeech}
                </span>
              ))}
            </div>
          </div>

          {/* معانی */}
          <div className="space-y-2">
            {dictionaryData.meanings?.slice(0, 3).map((meaning: any, meaningIndex: number) => (
              <div key={meaningIndex} className="border-r-2 border-cyan-500/30 pr-3">
                <p className="text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-1">
                  {meaning.partOfSpeech}
                </p>
                <ul className="space-y-1">
                  {meaning.definitions?.slice(0, 3).map((def: any, defIndex: number) => (
                    <li key={defIndex} className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-cyan-600 dark:text-cyan-400 mt-1">•</span>
                      <span>{def.definition}</span>
                    </li>
                  ))}
                </ul>
                
                {/* مثال‌ها */}
                {meaning.definitions?.[0]?.example && (
                  <div className="mt-2 p-2 bg-gray-200 dark:bg-gray-800/50 rounded-lg border-r-2 border-purple-500/30">
                    <p className="text-purple-700 dark:text-purple-300 text-xs font-medium mb-1">مثال:</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{meaning.definitions[0].example}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* مترادف‌ها */}
          {dictionaryData.meanings?.[0]?.synonyms && dictionaryData.meanings[0].synonyms.length > 0 && (
            <div className="pt-2 border-t border-gray-300 dark:border-gray-700/50">
              <p className="text-cyan-700 dark:text-cyan-300 text-sm font-medium mb-2">مترادف‌ها:</p>
              <div className="flex flex-wrap gap-1">
                {dictionaryData.meanings[0].synonyms.slice(0, 5).map((synonym: string, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-300 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400 dark:hover:bg-gray-600/50 transition-colors cursor-pointer"
                    onClick={() => onWordSelect(synonym)}
                  >
                    {synonym}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-500 text-sm">اطلاعاتی برای این کلمه یافت نشد</p>
        </div>
      )}
    </div>
  );
};

// کامپوننت برای نمایش متن قابل کلیک
const ClickableText = ({ text, onWordClick }: { text: string; onWordClick: (word: string) => void }) => {
  // تابع برای استخراج کلمات از متن
  const extractWords = (text: string): string[] => {
    const words = text.split(/\s+/);
    const englishWords: string[] = [];
    
    words.forEach(word => {
      // حذف تمام کاراکترهای غیر انگلیسی از انتهای کلمه
      const cleanWord = word.replace(/[^a-zA-Z]$/g, '').replace(/^[^a-zA-Z]/g, '');
      
      // فقط کلمات انگلیسی با حداقل ۲ حرف
      if (cleanWord.length > 1 && /^[a-zA-Z]+$/.test(cleanWord)) {
        englishWords.push(cleanWord);
      }
    });
    
    return englishWords;
  };

  const words = extractWords(text);
  
  if (words.length === 0) {
    return <span>{text}</span>;
  }

  let lastIndex = 0;
  const elements: JSX.Element[] = [];

  words.forEach((word, index) => {
    const wordStart = text.indexOf(word, lastIndex);
    
    // اضافه کردن متن قبل از کلمه
    if (wordStart > lastIndex) {
      elements.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, wordStart)}
        </span>
      );
    }
    
    // اضافه کردن کلمه قابل کلیک
    elements.push(
      <span
        key={`word-${index}`}
        onClick={(e) => {
          e.stopPropagation();
          onWordClick(word);
        }}
        className="cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-500/20 px-1 rounded transition-all duration-200 border-b border-dashed border-cyan-500/50"
        title="کلیک برای افزودن به فلش‌کارت"
      >
        {word}
      </span>
    );
    
    lastIndex = wordStart + word.length;
  });

  // اضافه کردن متن باقی‌مانده
  if (lastIndex < text.length) {
    elements.push(
      <span key="text-final">
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <>{elements}</>;
};

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [showVocabularies, setShowVocabularies] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // State جدید برای مدیریت پاپ‌آپ
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [customWord, setCustomWord] = useState("");
  const [customMeaning, setCustomMeaning] = useState("");
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  // Effect برای وقتی کلمه انتخاب شد
  useEffect(() => {
    if (selectedWord) {
      setCustomWord(selectedWord);
      autoTranslateWord(selectedWord);
    }
  }, [selectedWord]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles/${articleId}`);
      
      if (!response.ok) {
        throw new Error('مقاله یافت نشد');
      }
      
      const data = await response.json();
      setArticle(data.article);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری مقاله');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/articles');
  };

  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  // تابع برای ترجمه خودکار کلمه
  const autoTranslateWord = async (word: string) => {
    if (!word.trim()) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch(`/api/translate?text=${encodeURIComponent(word)}&target=fa`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomMeaning(data.translatedText || "");
      } else {
        // اگر API ترجمه کار نکرد، از لغت‌های موجود جستجو کن
        const existingVocab = article?.vocabularies.find(v => 
          v.word.toLowerCase() === word.toLowerCase()
        );
        if (existingVocab) {
          setCustomMeaning(existingVocab.meaning);
        }
      }
    } catch (error) {
      console.error("Translation error:", error);
      // در صورت خطا، از لغت‌های موجود جستجو کن
      const existingVocab = article?.vocabularies.find(v => 
        v.word.toLowerCase() === word.toLowerCase()
      );
      if (existingVocab) {
        setCustomMeaning(existingVocab.meaning);
      }
    } finally {
      setIsTranslating(false);
    }
  };

  // تابع برای انتخاب کلمه از مترادف‌ها
  const handleWordSelect = (word: string) => {
    setCustomWord(word);
    autoTranslateWord(word);
  };

  // تابع برای افزودن کارت
  const handleAddToFlashcards = async () => {
    if (!customWord.trim() || !customMeaning.trim()) {
      alert("لطفاً هم کلمه و هم معنی را وارد کنید.");
      return;
    }

    setIsAddingCard(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          front: customWord.trim(), 
          back: customMeaning.trim() 
        }),
      });

      if (response.ok) {
        alert("کارت با موفقیت به فلش‌کارت‌ها اضافه شد!");
        setSelectedWord(null);
        setCustomWord("");
        setCustomMeaning("");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در افزودن کارت.");
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور.");
    } finally {
      setIsAddingCard(false);
    }
  };

  // تابع برای ترجمه دستی
  const handleManualTranslate = async () => {
    if (customWord.trim()) {
      await autoTranslateWord(customWord.trim());
    }
  };

  // تابع برای رندر کلمات در پاراگراف (همراه با کلمات از پیش تعریف شده و کلمات جدید)
  const renderWordsInParagraph = (paragraph: string, paragraphIndex: number) => {
    const words = paragraph.split(' ');
    
    return words.map((word, wordIndex) => {
      const cleanWord = word.replace(/[.,!?;:]$/g, '');
      const vocab = article?.vocabularies.find(
        v => v.word.toLowerCase() === cleanWord.toLowerCase()
      );
      
      // اگر کلمه در vocabularies وجود داشت، با استایل سبز نمایش بده
      if (vocab) {
        return (
          <span
            key={`${paragraphIndex}-${wordIndex}`}
            onClick={(e) => {
              e.stopPropagation();
              handleWordClick(vocab.word);
            }}
            className="cursor-pointer text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 border-b-2 border-dashed border-green-500/50 mx-0.5 font-medium transition-colors duration-200"
            title={`${vocab.word}: ${vocab.meaning}`}
          >
            {word}{' '}
          </span>
        );
      }
      
      // اگر کلمه انگلیسی است اما در vocabularies نیست، با استایل cyan نمایش بده
      if (cleanWord.length > 1 && /^[a-zA-Z]+$/.test(cleanWord)) {
        return (
          <span
            key={`${paragraphIndex}-${wordIndex}`}
            onClick={(e) => {
              e.stopPropagation();
              handleWordClick(cleanWord);
            }}
            className="cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-500/20 px-1 rounded transition-all duration-200 border-b border-dashed border-cyan-500/50"
            title="کلیک برای افزودن به فلش‌کارت"
          >
            {word}{' '}
          </span>
        );
      }
      
      // کلمات غیر انگلیسی
      return <span key={`${paragraphIndex}-${wordIndex}`}>{word} </span>;
    });
  };

  const splitContentIntoParagraphs = (content: string): string[] => {
    return content.split('\n').filter(paragraph => paragraph.trim().length > 0);
  };

  const getAllVocabularies = () => {
    if (!article) return [];
    return article.vocabularies;
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('خطا در اشتراک‌گذاری');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('لینک مقاله کپی شد');
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری مقاله...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">خطا</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors"
          >
            بازگشت به مقالات
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const paragraphs = splitContentIntoParagraphs(article.content);
  const allVocabularies = getAllVocabularies();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* پاپ‌آپ دیکشنری */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 dark:bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-cyan-400/30 rounded-2xl backdrop-blur-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

            {/* Scrollable Content */}
            <div className="flex-1 mt-3 pt-3 overflow-y-auto px-6 pb-6 custom-popup-scrollbar">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-gray-900 dark:text-white text-sm font-medium">کلمه انگلیسی:</label>
                  <input
                    type="text"
                    value={customWord}
                    onChange={(e) => setCustomWord(e.target.value)}
                    placeholder="کلمه انگلیسی را وارد کنید..."
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-900 dark:text-white text-sm font-medium">معنی فارسی:</label>
                    <button
                      onClick={handleManualTranslate}
                      disabled={isTranslating || !customWord.trim()}
                      className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 text-xs flex items-center gap-1 disabled:opacity-50"
                    >
                      {isTranslating ? (
                        <>
                          <div className="w-3 h-3 border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                          در حال ترجمه...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          ترجمه خودکار
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customMeaning}
                    onChange={(e) => setCustomMeaning(e.target.value)}
                    placeholder={isTranslating ? "در حال ترجمه..." : "معنی فارسی را وارد کنید..."}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddToFlashcards()}
                    disabled={isTranslating}
                  />
                  {isTranslating && (
                    <div className="text-cyan-600 dark:text-cyan-400 text-xs flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-cyan-600 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      در حال ترجمه خودکار...
                    </div>
                  )}
                </div>

                {/* بخش دیکشنری */}
                <DictionarySection word={customWord} onWordSelect={handleWordSelect} />
              </div>
            </div>

            {/* Footer - دکمه‌ها */}
            <div className="mb-2 flex-shrink-0 p-6 pt-4 border-t border-gray-300 dark:border-gray-700/50">
              <div className="flex gap-3">
                <button 
                  onClick={handleAddToFlashcards}
                  disabled={isAddingCard || !customWord.trim() || !customMeaning.trim()}
                  className={`flex-1 py-3 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    isAddingCard || !customWord.trim() || !customMeaning.trim()
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25"
                  }`}
                >
                  {isAddingCard ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      در حال افزودن...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      افزودن به فلش‌کارت
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => {
                    setSelectedWord(null);
                    setCustomWord("");
                    setCustomMeaning("");
                  }}
                  className="px-6 py-3 rounded-xl bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowRight className="h-5 w-5" />
              بازگشت به مقالات
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVocabularies(!showVocabularies)}
                className={`p-2 transition-colors ${
                  showVocabularies 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
                }`}
                title="نمایش/مخفی کردن لغات"
              >
                <BookOpen className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="اشتراک‌گذاری"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              <button 
                onClick={toggleBookmark}
                className={`p-2 transition-colors ${
                  isBookmarked 
                    ? 'text-yellow-600 dark:text-yellow-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400'
                }`}
                title={isBookmarked ? 'حذف از نشان‌ها' : 'افزودن به نشان‌ها'}
              >
                <Bookmark className="h-5 w-5" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Article Header */}
        <div className="text-center mb-12">
          {article.coverUrl && (
            <div className="mb-8">
              <img
                src={article.coverUrl}
                alt={article.title}
                className="w-full max-w-4xl mx-auto h-80 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          )}
          
          <div className="flex items-center justify-center gap-6 mb-6">
            <span className="px-3 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs border border-green-500/30 font-medium">
              سطح {article.level}
            </span>
            {article.readingTime && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
                <Clock className="h-4 w-4" />
                زمان مطالعه: {article.readingTime} دقیقه
              </div>
            )}
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              {new Date(article.createdAt).toLocaleDateString('fa-IR')}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              <ClickableText text={article.excerpt} onWordClick={handleWordClick} />
            </p>
          )}
        </div>

        {/* Content and Vocabulary Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className={`${showVocabularies ? 'lg:w-2/3' : 'w-full'}`}>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl  border border-gray-200 dark:border-gray-700">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {paragraphs.map((paragraph, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl transition-all duration-300 ${
                      index === currentParagraph
                        ? 'bg-green-500/10 border-2 border-green-500/20 shadow-lg'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer border border-transparent'
                    }`}
                    onClick={() => setCurrentParagraph(index)}
                  >
                    <p className="text-gray-700 dark:text-gray-300 leading-8 text-justify text-lg">
                      {renderWordsInParagraph(paragraph, index)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vocabulary Sidebar */}
          {showVocabularies && (
            <div className="lg:w-1/3 mb-9">
              <div className="sticky top-24 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                  تمام لغات مقاله
                  <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-medium">
                    {allVocabularies.length} لغت
                  </span>
                </h3>
                
                {allVocabularies.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {allVocabularies.map((vocab) => (
                      <div
                        key={vocab.id}
                        className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex-1">
                          <span className="font-bold text-gray-900 dark:text-white text-lg block mb-2">
                            {vocab.word}
                          </span>
                          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                            {vocab.meaning}
                          </p>
                          {vocab.paragraph && (
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                              پاراگراف: {vocab.paragraph}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      لغتی برای این مقاله تعریف نشده
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-popup-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-popup-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          margin: 4px 0;
        }
        .custom-popup-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
        .custom-popup-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }

        @media (prefers-color-scheme: dark) {
          .custom-popup-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
          }
        }
      `}</style>
    </div>
  );
}