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
  Star,
  Zap,
  Target
} from "lucide-react";

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
        // آپدیت آمار session
        setSessionStats(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          incorrect: prev.incorrect + (isCorrect ? 0 : 1)
        }));

        if (currentCardIndex === cards.length - 1) {
          setShowConfetti(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else {
          handleNext();
        }
      } else {
        const data = await response.json();
        console.error(data.error || "خطا در ثبت پاسخ.");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-solid border-cyan-500/30 border-t-cyan-500 mx-auto"></div>
            <div className="absolute inset-0 h-20 w-20 animate-ping rounded-full border-4 border-cyan-500/20 mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-400 font-medium text-lg">در حال آماده‌سازی کارت‌ها...</p>
          <p className="text-gray-500 text-sm mt-2">لطفاً چند لحظه صبر کنید</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
        <div className="text-center bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl max-w-md border border-gray-700/50 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-6 shadow-lg shadow-green-500/30">
              <Sparkles className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
              آفرین! 🎉
            </h1>
            <p className="text-gray-400 text-lg mb-2">همه کارت‌های امروز رو مرور کردی</p>
            <p className="text-gray-500 text-sm">کارت‌های جدید فردا برای مرور آماده می‌شن</p>
            
            <div className="mt-8 grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <div className="text-2xl font-bold text-green-400">{sessionStats.correct}</div>
                <div className="text-gray-400 text-sm">پاسخ صحیح</div>
              </div>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/30">
                <div className="text-2xl font-bold text-amber-400">{sessionStats.incorrect}</div>
                <div className="text-gray-400 text-sm">نیاز به تمرین</div>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer mt-8 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 w-full font-semibold shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:scale-[1.02] group"
            >
              <span className="flex items-center justify-center gap-2">
                بازگشت به داشبورد
                <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <Sparkles className="h-32 w-32 text-yellow-400 animate-bounce mx-auto mb-6" />
              <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-4">
              تبریک! 🎊
            </h2>
            <p className="text-2xl text-white/80">مرور امروزت تموم شد!</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full relative z-10">


        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">در حال مرور</span>
            </div>
            <span className="text-sm text-cyan-400 font-medium">
              {currentCardIndex + 1} / {cards.length}
            </span>
          </div>
          <div className="bg-gray-800/50 rounded-full h-3 backdrop-blur-sm border border-gray-700/50 overflow-hidden">
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
              <div className="w-full h-full bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-700/50 p-2 relative overflow-hidden group-hover:border-cyan-500/30 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20">
                    <RotateCcw className="h-3 w-3" />
                    <span>برای دیدن پاسخ کلیک کن</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-700/30 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span>جعبه {currentCard.boxNumber}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] gap-8">
                  {/* Main Word */}
                  <div className="text-center">
                    <div className=" items-center gap-4 justify-center mb-10">
                      <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                        {currentCard.front}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTextToSpeech(currentCard.front, 'word');
                        }}
                        className="p-1 text-gray-400 hover:text-cyan-400 transition-all duration-200 hover:bg-gray-700/50 rounded-xl hover:scale-110"
                      >
                        <Volume2 className="h-6 w-6" />
                      </button>
                    </div>
                    
                    {currentCard.pronunciation && (
                      <p className="text-gray-400 text-lg">{currentCard.pronunciation}</p>
                    )}
                  </div>
                  
                  {/* Example */}
                  {currentCard.example && (
                    <div className="text-center w-full max-w-2xl">
                      <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                        <p className="text-gray-400 text-sm mb-3 font-medium">مثال کاربردی</p>
                        <div className="flex items-center gap-3 justify-center mb-3">
                          <p className="text-xl text-gray-300 leading-relaxed">
                            {currentCard.example}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playTextToSpeech(currentCard.example!, 'sentence');
                            }}
                            className="p-2 text-gray-500 hover:text-cyan-400 transition-colors duration-200 hover:bg-gray-600/50 rounded-lg"
                          >
                            <Volume2 className="h-5 w-5" />
                          </button>
                        </div>
                        {currentCard.exampleTranslation && (
                          <p className="text-gray-400 text-lg leading-relaxed border-t border-gray-600/30 pt-3">
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
    className="flex items-center gap-1 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-gray-600/50 text-sm"
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
    className="flex items-center gap-1 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-gray-600/50 text-sm"
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