// app/dashboard/review/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, X, RotateCcw, Sparkles, Volume2, ChevronLeft, ChevronRight } from "lucide-react";

interface Card {
  id: string;
  front: string;
  back: string;
  boxNumber: number;
  example?: string;
  exampleTranslation?: string; // Added translation for the example
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
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
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
        if (currentCardIndex === cards.length - 1) {
          setShowConfetti(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          handleNext();
        }
      } else {
        const data = await response.json();
        alert(data.error || "خطا در ثبت پاسخ.");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
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
      
      // تنظیمات برای کلمه یا جمله
      if (type === 'word') {
        utterance.rate = 0.8; // سرعت کمتر برای تلفظ شمرده
        utterance.pitch = 1;
      } else {
        utterance.rate = 1; // سرعت نرمال برای جملات
        utterance.pitch = 1;
      }
      
      utterance.lang = 'en-US';
      utterance.volume = 1;
      
      // توقف پخش‌های قبلی
      speechSynthesis.cancel();
      
      // پخش صدا
      speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-violet-500/30 border-t-violet-500 mx-auto"></div>
            <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full border-4 border-violet-500/20 mx-auto"></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">در حال بارگذاری کارت‌ها...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="text-center bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl max-w-md border border-slate-700/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-6 shadow-lg shadow-emerald-500/50">
              <Check className="h-8 w-8 text-white" strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              موفق باشی!
            </h1>
            <p className="mt-3 text-slate-400">هیچ کارتی برای مرور امروز نداری.</p>
            <button
              onClick={() => router.push("/")}
              className="cursor-pointer mt-8 px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl hover:from-violet-500 hover:to-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 w-full font-semibold shadow-lg shadow-violet-500/30 transition-all duration-200 hover:scale-[1.02]"
            >
              بازگشت به داشبورد
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-24 w-24 text-yellow-400 animate-pulse mx-auto mb-4" />
            <p className="text-4xl font-bold text-white">تبریک! 🎉</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-full border border-violet-500/30">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-300">حالت مرور</span>
            </div>
            
            <p className="text-slate-400">
              کارت <span className="text-violet-400 font-semibold">{currentCardIndex + 1}</span> از{" "}
              <span className="text-violet-400 font-semibold">{cards.length}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 relative">
            <div className="bg-slate-800/50 rounded-full h-3 backdrop-blur-sm border border-slate-700/50 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>شروع</span>
              <span>{Math.round(progress)}%</span>
              <span>پایان</span>
            </div>
          </div>
        </div>

        {/* Card Container */}
        <div className="relative mb-8" style={{ perspective: '1500px' }}>
          <div
            className="relative w-full min-h-[420px] cursor-pointer group"
            onClick={handleFlip}
          >
            {/* Front Side */}
            <div
              className={`absolute inset-0 w-full transition-all duration-700 ease-out transform-gpu ${
                isFlipped 
                  ? 'opacity-0 pointer-events-none rotate-y-180 scale-95' 
                  : 'opacity-100 rotate-y-0 scale-100'
              }`}
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/50 p-8 relative overflow-hidden group-hover:border-violet-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                  <RotateCcw className="h-3 w-3" />
                  <span>برای دیدن پاسخ کلیک کن</span>
                </div>
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[360px] gap-6">
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-center text-white leading-relaxed">
                      {currentCard.front}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTextToSpeech(currentCard.front, 'word');
                      }}
                      className="p-2 text-slate-400 hover:text-violet-400 transition-colors duration-200 hover:bg-slate-700/50 rounded-lg"
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {currentCard.example && (
                    <div className="text-center w-full">
                      <p className="text-slate-400 text-sm mb-2">مثال:</p>
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <p className="text-lg text-slate-300 leading-relaxed">
                          {currentCard.example}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTextToSpeech(currentCard.example!, 'sentence');
                          }}
                          className="p-1 text-slate-500 hover:text-violet-400 transition-colors duration-200"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                      {currentCard.exampleTranslation && (
                        <p className="text-slate-400 text-base leading-relaxed">
                          {currentCard.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-white">
                      جعبه {currentCard.boxNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Side */}
            <div
              className={`absolute inset-0 w-full transition-all duration-700 ease-out transform-gpu ${
                isFlipped 
                  ? 'opacity-100 rotate-y-0 scale-100' 
                  : 'opacity-0 pointer-events-none -rotate-y-180 scale-95'
              }`}
              style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
            >
              <div className="w-full h-full bg-gradient-to-br from-violet-600 to-violet-800 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[360px] gap-6">
                  <div className="flex items-center gap-3">
                    <p className="text-3xl font-bold text-center text-white leading-relaxed">
                      {currentCard.back}
                    </p>

                  </div>
                  
                  {currentCard.example && (
                    <div className="text-center w-full">
                      <p className="text-white/80 text-sm mb-2">مثال:</p>
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <p className="text-lg text-white leading-relaxed">
                          {currentCard.example}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playTextToSpeech(currentCard.example!, 'sentence');
                          }}
                          className="p-1 text-white/60 hover:text-white transition-colors duration-200"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                      </div>
                      {currentCard.exampleTranslation && (
                        <p className="text-white/70 text-base leading-relaxed">
                          {currentCard.exampleTranslation}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-white">
                      جعبه {currentCard.boxNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentCardIndex === 0}
            className="flex items-center gap-2 px-3 py-4 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            <ChevronRight className="h-5 w-5" />
          
          </button>
          
          <button
            onClick={handleIncorrect}
            disabled={isSubmitting || !isFlipped}
            className="group flex items-center gap-3 px-3 py-4 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <X className="h-5 w-5 relative z-10" strokeWidth={2.5} />
            <span className="relative z-10">غلط</span>
          </button>
          
          <button
            onClick={handleCorrect}
            disabled={isSubmitting || !isFlipped}
            className="group flex items-center gap-3 px-3 py-4 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-500 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <Check className="h-5 w-5 relative z-10" strokeWidth={2.5} />
            <span className="relative  z-10">صحیح</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentCardIndex === cards.length - 1}
            className="flex items-center gap-2 px-3 py-4 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
         
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Hint Text */}
        {!isFlipped && (
          <p className="text-center mt-6 text-slate-500 text-sm animate-pulse">
            ابتدا کارت را برای دیدن پاسخ بچرخان
          </p>
        )}
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