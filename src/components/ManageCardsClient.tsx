"use client";

import { useState, useEffect } from "react";
import { Card } from "@prisma/client";

export function ManageCardsClient() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setAllCards(data);
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoxChange = async (cardId: string, newBoxNumber: number) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBoxNumber }),
      });

      if (response.ok) {
        setAllCards(allCards.map(card =>
          card.id === cardId ? { ...card, boxNumber: newBoxNumber } : card
        ));
      } else {
        alert("خطا در به‌روزرسانی جعبه.");
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور.");
    }
  };

  // تابع اصلاح شده و مقاوم‌تر برای محاسبه زمان باقی‌مانده تا مرور
  const getTimeUntilReview = (nextReviewAt: string | Date | null | undefined) => {
    // **اولین و مهم‌ترین بررسی: اگر داده وجود ندارد**
    if (!nextReviewAt) {
      return "زمان مرور مشخص نیست";
    }

    const now = new Date();
    const reviewDate = new Date(nextReviewAt);

    // **بررسی دوم: آیا تاریخ معتبر است؟**
    if (isNaN(reviewDate.getTime())) {
      return "تاریخ نامعتبر";
    }

    const diffInMs = reviewDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays <= 0) {
      return "امروز";
    } else if (diffInDays === 1) {
      return "فردا";
    } else if (diffInDays <= 7) {
      return `${diffInDays} روز دیگر`;
    } else {
      const weeks = Math.floor(diffInDays / 7);
      const remainingDays = diffInDays % 7;
      if (remainingDays === 0) {
        return `${weeks} هفته دیگر`;
      } else {
        return `${weeks} هفته و ${remainingDays} روز دیگر`;
      }
    }
  };

  if (isLoading) {
    return <p className="mt-4 text-gray-400">در حال بارگذاری کارت‌ها...</p>;
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 text-white shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-300">مدیریت تمام کارت‌ها</h2>
        <p className="text-sm text-gray-400 mt-1">جعبه هر کارت را میتوانید به صورت دستی تغییر دهید.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-900/50">
            <tr className="text-gray-400 text-right">
              <th className="p-4 font-medium">کلمه (روی کارت)</th>
              <th className="p-4 font-medium">زمان باقی‌مانده تا مرور</th>
              <th className="p-4 font-medium">تغییر جعبه</th>
            </tr>
          </thead>
          <tbody>
            {allCards.map((card) => (
              <tr
                key={card.id}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
              >
                <td className="p-4">{card.front}</td>
                <td className="p-4 text-sm text-gray-300">
                  {getTimeUntilReview(card.nextReviewAt)}
                </td>
                <td className="p-4">
                  <select
                    value={card.boxNumber}
                    onChange={(e) => handleBoxChange(card.id, Number(e.target.value))}
                    className="rounded-md border border-gray-600 bg-gray-900 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>
                        جعبه {num}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {allCards.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            شما هنوز هیچ کارتی نساخته‌اید.
          </div>
        )}
      </div>
    </div>
  );
}