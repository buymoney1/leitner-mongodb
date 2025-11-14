// components/AddCardClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCardClient() {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!front.trim() || !back.trim()) {
      alert("لطفاً هر دو فیلد را پر کنید.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });

      if (response.ok) {
        alert("کارت با موفقیت به جعبه ۱ اضافه شد!");
        setFront("");
        setBack("");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "خطا در افزودن کارت.");
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* فیلد روی کارت */}
      <div>
        <label htmlFor="front" className="block text-sm font-medium text-gray-300">
          روی کارت (مثال: "Accommodate")
        </label>
        <input
          id="front"
          type="text"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="متن روی کارت را وارد کنید..."
          className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          required
        />
      </div>

      {/* فیلد پشت کارت */}
      <div>
        <label htmlFor="back" className="block text-sm font-medium text-gray-300">
          پشت کارت (مثال: "جای دادن، اسکان دادن")
        </label>
        <input
          id="back"
          type="text"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="معنی یا ترجمه کارت را وارد کنید..."
          className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          required
        />
      </div>

      {/* دکمه افزودن کارت */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "در حال افزودن..." : "افزودن کارت"}
      </button>
    </div>
  );
}
