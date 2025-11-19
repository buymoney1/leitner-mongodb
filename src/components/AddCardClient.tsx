// components/AddCardClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, BookOpen, RotateCcw } from "lucide-react";

export default function AddCardClient() {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
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
        // افکت موفقیت
        setIsFlipped(true);
        setTimeout(() => {
          setFront("");
          setBack("");
          setIsFlipped(false);
        }, 2000);
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

  const handleReset = () => {
    setFront("");
    setBack("");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 p-5 md:p-6">
      <div className="max-w-2xl mx-auto">



        {/* Input Form */}
        <div className="space-y-6 bg-gray-50 dark:bg-gray-800/20 rounded-3xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm p-6 md:p-8">
          {/* Front Input */}
          <div className="group">
            <label htmlFor="front" className="block text-sm font-medium text-cyan-600 dark:text-cyan-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              روی کارت
            </label>
            <div className="relative">
              <input
                id="front"
                type="text"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="مثال: Accommodate"
                className="w-full rounded-2xl border-2 border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 px-4 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white dark:focus:bg-gray-900/70 transition-all duration-300 backdrop-blur-sm text-sm"
                required
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* Back Input */}
          <div className="group">
            <label htmlFor="back" className="block text-sm font-medium text-purple-600 dark:text-purple-300 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              پشت کارت
            </label>
            <div className="relative">
              <input
                id="back"
                type="text"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="مثال: جای دادن، اسکان دادن"
                className="w-full rounded-2xl border-2 border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-900/50 px-4 py-4 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white dark:focus:bg-gray-900/70 transition-all duration-300 backdrop-blur-sm text-sm"
                required
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !front.trim() || !back.trim()}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-4 text-white font-bold text-sm shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال افزودن...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>افزودن کارت</span>
                </>
              )}
            </div>
            
            {/* Button Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>

        {/* Card Preview */}
        <div className=" mt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
              پیش‌نمایش کارت
            </h3>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              بازنشانی
            </button>
          </div>
          
          <div className="relative group">
            {/* Card Container */}
            <div className={`relative h-48 rounded-3xl border-2 backdrop-blur-xl transition-all duration-500 transform perspective-1000 ${
              isFlipped ? '' : ''
            } ${
              front || back 
                ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 dark:from-cyan-500/10 dark:to-purple-500/10 border-cyan-400/30 dark:border-cyan-400/30 shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-500/20' 
                : 'bg-gray-100 dark:bg-gray-800/30 border-gray-300 dark:border-gray-700/50'
            }`}>
              
              {/* Front Side */}
              <div className={`absolute inset-0 p-6 flex flex-col justify-center items-center transition-opacity duration-300 ${
                isFlipped ? 'opacity-0' : 'opacity-100'
              }`}>
                {front ? (
                  <>
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white text-center leading-relaxed">
                      {front}
                    </p>
                    <p className="text-cyan-500 dark:text-cyan-400 text-sm mt-2">روی کارت</p>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-8 h-8 text-gray-500 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-500 text-sm">روی کارت را وارد کنید</p>
                  </div>
                )}
              </div>

              {/* Back Side (Success State) */}
              <div className={`absolute inset-0 p-6 flex flex-col justify-center items-center bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/20 dark:to-emerald-500/20 rounded-3xl border-2 border-emerald-400/30 transition-opacity duration-300 ${
                isFlipped ? 'opacity-100' : 'opacity-0'
              }`}>
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-emerald-500 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  کارت اضافه شد!
                </p>
                <p className="text-emerald-600 dark:text-emerald-300 text-sm text-center">
                  کارت با موفقیت به جعبه ۱ اضافه شد
                </p>
              </div>
            </div>

            {/* Glow Effect */}
            <div className={`absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 ${
              front || back ? 'opacity-30' : ''
            }`}></div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            💡 نکته: کارت‌های جدید به صورت خودکار در جعبه ۱ قرار می‌گیرند
          </p>
        </div>
      </div>
    </div>
  );
}