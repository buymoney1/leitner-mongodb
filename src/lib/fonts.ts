// lib/fonts.ts
import { Vazirmatn } from "next/font/google";

// تعریف فونت وزیر با تنظیمات مورد نیاز
export const vazir = Vazirmatn({
  subsets: ["arabic"], // برای پشتیبانی از حروف فارسی
  variable: "--font-vazir", // نام یک متغیر CSS برای استفاده در Tailwind
  weight: ["300", "400", "500", "700", "900"], // وزن‌های مورد نیاز فونت
});