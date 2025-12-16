// app/dashboard/review/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Check, 
  X, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  ChevronLeft, 
  ChevronRight,
  Book, 
} from "lucide-react";
import { toast } from "sonner"; // Import toast from sonner

interface Card {
  id: string;
  front: string;
  back: string;
  boxNumber: number;
  example?: string;
  exampleTranslation?: string;
  pronunciation?: string;
}

export default function ReviewPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 });
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      fetchDueCards();
    }
  }, [session]);

  const fetchDueCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cards/due");
      if (response.ok) {
        const data = await response.json();
        setCards(data);
        // اگر کارتی برای مرور نبود، toast نمایش داده شود
        if (data.length === 0) {
          toast.success("✅ مرور امروزت تمام شد!", {
            description: "کارت‌های امروز را به پایان رساندید.",
            duration: 5000,
            position: "top-center",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      toast.error("خطا در دریافت کارت‌ها", {
        description: "لطفاً دوباره تلاش کنید.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (isCorrect: boolean) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const currentCard = cards[currentCardIndex];

    try {
      const response = await fetch("/api/cards/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: currentCard.id, isCorrect }),
      });

      if (response.ok) {
        // آپدیت آمار session
        setSessionStats(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          incorrect: prev.incorrect + (isCorrect ? 0 : 1)
        }));

        if (currentCardIndex === cards.length - 1) {
          // وقتی آخرین کارت مرور شد
          toast.success("🎉 تبریک! مرور امروزت تکمیل شد.", {
            description: `امروز ${sessionStats.correct + (isCorrect ? 1 : 0)} از ${cards.length} کارت را صحیح پاسخ دادی.`,
            duration: 6000,
            position: "top-center",
          });
          
          setShowConfetti(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else {
          handleNext();
        }
      } else {
        const data = await response.json();
        toast.error("خطا در ثبت پاسخ", {
          description: data.error || "لطفاً دوباره تلاش کنید.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("خطا در ارتباط با سرور", {
        description: "لطفاً اتصال اینترنت خود را بررسی کنید.",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCorrect = () => handleReview(true);
  const handleIncorrect = () => handleReview(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => Math.min(prev + 1, cards.length - 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const playTextToSpeech = (text: string, type: 'word' | 'sentence') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = type === 'word' ? 0.8 : 1;
      utterance.pitch = 1;
      utterance.lang = 'en-US';
      utterance.volume = 1;
      
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="text-center">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-solid border-cyan-500/30 border-t-cyan-500 mx-auto"></div>
            <div className="absolute inset-0 h-20 w-20 animate-ping rounded-full border-4 border-cyan-500/20 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium text-lg">در حال آماده‌سازی کارت‌ها...</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">لطفاً چند لحظه صبر کنید</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-500">
        <div className="text-center relative w-full max-w-md">
          {/* Animated background glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/5 via-cyan-500/5 to-blue-500/5 dark:from-green-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 rounded-3xl blur-2xl animate-pulse"></div>
          
          <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-10 sm:p-12 rounded-3xl shadow-2xl dark:shadow-2xl border border-gray-200/60 dark:border-gray-700/40 overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/5 via-cyan-500/5 to-blue-500/5 dark:from-green-500/10 dark:via-cyan-500/10 dark:to-blue-500/10"></div>
            
            {/* Floating orbs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              {/* Icon/Emoji container */}
              <div className="mb-8">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-cyan-500/10 dark:from-green-500/15 dark:to-cyan-500/15 border border-green-500/20 dark:border-cyan-500/20">
                  <div className="text-4xl">🎯</div>
                </div>
              </div>
              
              {/* Message */}
              <p className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl font-medium mb-2">
                همه کارت‌های امروز رو تموم کردی!
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-10">
                فردا با کارت‌های جدید برگرد
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                {/* کتابخانه Button */}
                <button
                  onClick={() => router.push("/books")}
                  className="relative w-full overflow-hidden rounded-xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  
                  <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-base shadow-xl shadow-purple-500/25 dark:shadow-purple-500/15 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/35 dark:group-hover:shadow-purple-500/25 group-hover:scale-[1.02] group-active:scale-[0.98]">
                    <span className="flex items-center justify-center gap-3">
                      کتابخانه
                      <Book className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    </span>
                  </div>
                </button>

                {/* داشبورد Button */}
                <button
                  onClick={() => router.push("/dashboard")}
                  className="relative w-full overflow-hidden rounded-xl group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-20 blur-lg transition-all duration-500"></div>
                  
                  <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-base shadow-xl shadow-cyan-500/25 dark:shadow-cyan-500/15 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-cyan-500/35 dark:group-hover:shadow-cyan-500/25 group-hover:scale-[1.02] group-active:scale-[0.98]">
                    <span className="flex items-center justify-center gap-3">
                      داشبورد
                      <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>



      <div className="max-w-4xl mx-auto w-full relative z-10">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">در حال مرور</span>
            </div>
            <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
              {currentCardIndex + 1} / {cards.length}
            </span>
          </div>
          <div className="bg-gray-200 dark:bg-gray-800/50 rounded-full h-3 backdrop-blur-sm border border-gray-300 dark:border-gray-700/50 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Card Container */}
        <div className="relative mb-8" style={{ perspective: '2000px' }}>
          <div
            className="relative w-full min-h-[370px] cursor-pointer group"
            onClick={handleFlip}
          >
            {/* Front Side */}
            <div
              className={`absolute inset-0 w-full transition-all duration-700 ease-out transform-gpu ${
                isFlipped 
                  ? 'opacity-0 pointer-events-none rotate-y-180' 
                  : 'opacity-100 rotate-y-0'
              }`}
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full bg-white dark:bg-gray-800/90 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl border-2 border-gray-300 dark:border-gray-700/50 p-2 relative overflow-hidden group-hover:border-cyan-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/20 px-3 py-1.5 rounded-full border border-cyan-500/20 dark:border-cyan-500/30">
                    <RotateCcw className="h-3 w-3" />
                    <span>برای دیدن پاسخ کلیک کن</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/30 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-pulse"></div>
                    <span>جعبه {currentCard.boxNumber}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] gap-8">
                  {/* Main Word */}
                  <div className="text-center">
                    <div className="flex items-center gap-4 justify-center mb-10">
                      <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-relaxed">
                        {currentCard.front}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTextToSpeech(currentCard.front, 'word');
                        }}
                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded-xl hover:scale-110"
                      >
                        <Volume2 className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {currentCard.pronunciation && (
                      <p className="text-gray-500 dark:text-gray-400 text-lg">{currentCard.pronunciation}</p>
                    )}
                  </div>
                  
                  {/* Example */}
                  {currentCard.example && (
                    <div className="text-center w-full max-w-2xl">
                      <div className="bg-gray-100 dark:bg-gray-700/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-600/30">
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 font-medium">مثال کاربردی</p>
                        <div className="flex items-center gap-3 justify-center mb-3">
                          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
                            {currentCard.example}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playTextToSpeech(currentCard.example!, 'sentence');
                            }}
                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-600/50 rounded-lg"
                          >
                            <Volume2 className="h-5 w-5" />
                          </button>
                        </div>
                        {currentCard.exampleTranslation && (
                          <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed border-t border-gray-300 dark:border-gray-600/30 pt-3">
                            {currentCard.exampleTranslation}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div
              className={`absolute inset-0 w-full transition-all duration-700 ease-out transform-gpu ${
                isFlipped 
                  ? 'opacity-100 rotate-y-0' 
                  : 'opacity-0 pointer-events-none -rotate-y-180'
              }`}
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-black/10 rounded-full blur-3xl"></div>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-sm text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                    <Sparkles className="h-3 w-3" />
                    <span>پاسخ</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>جعبه {currentCard.boxNumber}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] gap-8">
                  {/* Translation */}
                  <div className="text-center">
                    <div className="flex items-center gap-4 justify-center mb-32">
                      <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                        {currentCard.back}
                      </p>
                    </div>
                  </div>
                  
                  {/* Example */}
                  {currentCard.example && (
                    <div className="text-center w-full max-w-2xl">
                      <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                        <p className="text-white/80 text-sm mb-3 font-medium">مثال کاربردی</p>
                        <div className="flex items-center gap-3 justify-center mb-3">
                          <p className="text-xl text-white leading-relaxed">
                            {currentCard.example}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playTextToSpeech(currentCard.example!, 'sentence');
                            }}
                            className="p-2 text-white/60 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-lg"
                          >
                            <Volume2 className="h-5 w-5" />
                          </button>
                        </div>
                        {currentCard.exampleTranslation && (
                          <p className="text-white/70 text-lg leading-relaxed border-t border-white/20 pt-3">
                            {currentCard.exampleTranslation}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {/* قبلی */}
          <button
            onClick={handlePrev}
            disabled={currentCardIndex === 0}
            className="flex items-center gap-1 px-4 py-3 bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-gray-300 dark:border-gray-600/50 text-sm"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="hidden xs:block">قبلی</span>
          </button>

          {/* بلد نبودم */}
          <button
            onClick={handleIncorrect}
            disabled={isSubmitting || !isFlipped}
            className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-red-600 to-rose-700 text-white rounded-xl hover:from-red-500 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 relative overflow-hidden border border-red-500/30 text-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <X className="h-4 w-4 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">بلد نبودم</span>
          </button>

          {/* بلد بودم */}
          <button
            onClick={handleCorrect}
            disabled={isSubmitting || !isFlipped}
            className="group flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-500 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 relative overflow-hidden border border-green-500/30 text-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <Check className="h-4 w-4 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">بلد بودم</span>
          </button>

          {/* بعدی */}
          <button
            onClick={handleNext}
            disabled={currentCardIndex === cards.length - 1}
            className="flex items-center gap-1 px-4 py-3 bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-gray-300 dark:border-gray-600/50 text-sm"
          >
            <span className="hidden xs:block">بعدی</span>
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .-rotate-y-180 {
          transform: rotateY(-180deg);
        }
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
      `}</style>
    </div>
  );
}