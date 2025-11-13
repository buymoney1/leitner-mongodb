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
        router.push("/dashboard"); // هدایت به داشبورد
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
        <label htmlFor="front" className="block text-sm font-medium text-foreground">
          روی کارت (مثال: "Accommodate")
        </label>
        <input
          id="front"
          type="text"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="متن روی کارت را وارد کنید..."
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        />
      </div>

      {/* فیلد پشت کارت */}
      <div>
        <label htmlFor="back" className="block text-sm font-medium text-foreground">
          پشت کارت (مثال: "جای دادن، اسکان دادن")
        </label>
        <input
          id="back"
          type="text"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="معنی یا ترجمه کارت را وارد کنید..."
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        />
      </div>

      {/* دکمه افزودن کارت */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "در حال افزودن..." : "افزودن کارت"}
      </button>
    </div>
  );
}