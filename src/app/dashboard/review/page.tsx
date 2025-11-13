// app/dashboard/review/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

interface Card {
  id: string;
  front: string;
  back: string;
  boxNumber: number;
}

export default function ReviewPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        handleNext();
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
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      alert("مرور امروز تمام شد! عالی بود.");
      router.push("/dashboard");
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-muted-foreground">در حال بارگذاری کارت‌ها...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center bg-card text-card-foreground p-8 rounded-xl shadow-lg max-w-md border">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">موفق باشی!</h1>
          <p className="mt-2 text-muted-foreground">هیچ کارتی برای مرور امروز نداری.</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring w-full"
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">مرور کارت‌ها</h1>
          <p className="mt-3 text-muted-foreground">
            کارت {currentCardIndex + 1} از {cards.length}
          </p>
          <div className="mt-4 bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="relative mb-8" style={{ perspective: '1000px' }}>
          <div
            className="relative w-full h-64 cursor-pointer"
            onClick={handleFlip}
          >
            {/* روی کارت */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
                isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="w-full h-full bg-card text-card-foreground rounded-xl shadow-lg flex items-center justify-center p-6 border">
                <p className="text-xl font-semibold text-center">
                  {currentCard.front}
                </p>
              </div>
            </div>

            {/* پشت کارت */}
            <div
              className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
                isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="w-full h-full bg-primary text-primary-foreground rounded-xl shadow-lg flex items-center justify-center p-6">
                <div className="text-center">
                  <p className="text-xl font-semibold">
                    {currentCard.back}
                  </p>
                  <div className="mt-6">
                    <span className="inline-block px-3 py-1 text-sm font-semibold bg-primary-800/30 rounded-full">
                      جعبه {currentCard.boxNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleIncorrect}
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5 ml-2" />
            غلط
          </button>
          <button
            onClick={handleCorrect}
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-5 w-5 ml-2" />
            صحیح
          </button>
        </div>
      </div>
    </div>
  );
}