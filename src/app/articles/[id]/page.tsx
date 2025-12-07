// app/articles/[id]/page.tsx (نسخه آپدیت شده)
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Clock, Bookmark, Share2 } from 'lucide-react';
import DictionaryModal from '@/components/DictionaryModal';
import { toast } from 'sonner';


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

// کامپوننت برای نمایش متن قابل کلیک
const ClickableText = ({ text, onWordClick }: { text: string; onWordClick: (word: string) => void }) => {
  const extractWords = (text: string): string[] => {
    const words = text.split(/\s+/);
    const englishWords: string[] = [];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^a-zA-Z]$/g, '').replace(/^[^a-zA-Z]/g, '');
      
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
    
    if (wordStart > lastIndex) {
      elements.push(
        <span key={`text-${index}`}>
          {text.substring(lastIndex, wordStart)}
        </span>
      );
    }
    
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
  
  // State برای مدیریت مودال دیکشنری
  const [isDictionaryModalOpen, setIsDictionaryModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

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
    setIsDictionaryModalOpen(true);
  };

  // تابع برای افزودن کارت (به API ارسال می‌شود)
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
        toast.success('کارت با موفقیت به فلش‌کارت‌ها اضافه شد.');

        return Promise.resolve();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن کارت.");
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور.');

      return Promise.reject(error);
    }
  };

  // تابع برای رندر کلمات در پاراگراف
  const renderWordsInParagraph = (paragraph: string, paragraphIndex: number) => {
    const words = paragraph.split(' ');
    
    return words.map((word, wordIndex) => {
      const cleanWord = word.replace(/[.,!?;:]$/g, '');
      const vocab = article?.vocabularies.find(
        v => v.word.toLowerCase() === cleanWord.toLowerCase()
      );
      
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
      {/* مودال دیکشنری */}
      <DictionaryModal
        isOpen={isDictionaryModalOpen}
        onClose={() => setIsDictionaryModalOpen(false)}
        initialWord={selectedWord}
        onAddToFlashcards={handleAddToFlashcards}
      />

      {/* Header صفحه اصلی */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowRight className="h-5 w-5" />
              <span className="hidden sm:inline">بازگشت به مقالات</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVocabularies(!showVocabularies)}
                className={`p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
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
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="اشتراک‌گذاری"
              >
                <Share2 className="h-5 w-5" />
              </button>
              
              <button 
                onClick={toggleBookmark}
                className={`p-2 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${
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
                className="w-full max-w-4xl mx-auto h-64 md:h-80 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <span className="px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm border border-green-500/30 font-medium">
              سطح {article.level}
            </span>
            {article.readingTime && (
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                <Clock className="h-4 w-4" />
                زمان مطالعه: {article.readingTime} دقیقه
              </div>
            )}
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              {new Date(article.createdAt).toLocaleDateString('fa-IR')}
            </div>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight px-4">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
              <ClickableText text={article.excerpt} onWordClick={handleWordClick} />
            </p>
          )}
        </div>

        {/* Content and Vocabulary Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className={`${showVocabularies ? 'lg:w-2/3' : 'w-full'}`}>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {paragraphs.map((paragraph, index) => (
                  <div
                    key={index}
                    className={`p-4 md:p-6 rounded-xl transition-all duration-300 ${
                      index === currentParagraph
                        ? 'bg-green-500/10 border-2 border-green-500/20 shadow-lg'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer border border-transparent'
                    }`}
                    onClick={() => setCurrentParagraph(index)}
                  >
                    <p className="text-gray-700 dark:text-gray-300 leading-7 md:leading-8 text-justify text-base md:text-lg">
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
                  <span className="px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                    {allVocabularies.length} لغت
                  </span>
                </h3>
                
                {allVocabularies.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {allVocabularies.map((vocab) => (
                      <div
                        key={vocab.id}
                        className="p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg cursor-pointer"
                        onClick={() => {
                          setSelectedWord(vocab.word);
                          setIsDictionaryModalOpen(true);
                        }}
                      >
                        <div className="flex-1">
                          <span className="font-bold text-gray-900 dark:text-white text-lg block mb-2">
                            {vocab.word}
                          </span>
                          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                            {vocab.meaning}
                          </p>
                          {vocab.paragraph && (
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
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
    </div>
  );
}