'use client'

import { useState, useEffect } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const [remainingSpots, setRemainingSpots] = useState(1000);
  const [countdown, setCountdown] = useState({
    days: 7,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [selectedWord, setSelectedWord] = useState(null);
  const [addedWords, setAddedWords] = useState([]);
  const [currentTime, setCurrentTime] = useState(135);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSpots((prev) => (prev > 100 ? prev - Math.floor(Math.random() * 3) : prev));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      title: "یادگیری از محتوای واقعی",
      description: "زبان را از طریق فیلم‌ها، سریال‌ها و ویدیوهای آموزشی واقعی مسلط شوید.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      title: "زیرنویس دو زبانه تعاملی",
      description: "روی هر کلمه کلیک کنید تا آن را به سیستم فلش‌کارت اضافه کنید.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
    },
    {
      title: "سیستم هوشمند لایتنر",
      description: "سیستم فلش‌کارت هوشمند ما برنامه مرور شما را برای حداکثر حفظ کردن بهینه می‌کند.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "یادگیری مبتنی بر هوش مصنوعی",
      description: "تجزیه و تحلیل شخصی‌سازی شده و بینش‌ها برای تسریع سفر یادگیری زبان شما.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: "محتوای سطح‌بندی شده",
      description: "از A1 مبتدی تا C2 پیشرفته، ویدیوهایی را که کاملاً با سطح شما مطابقت دارند پیدا کنید.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: "آزمون‌های کاربردی",
      description: "دانش خود را با آزمون‌های آگاه از متن بر اساس محتوایی که تماشا کرده‌اید بسنجید.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const plans = [
    {
      name: "پایه",
      price: "رایگان",
      features: [
        "دسترسی به 50+ ویدیو",
        "ویژگی‌های پایه زیرنویس",
        "فضای محدود فلش‌کارت",
        "پشتیبانی از جامعه",
        "کتابخانه عمومی",
        "لغات آماده آیلتس",
      ],
      highlighted: false,
    },
    {
      name: "حرفه‌ای",
      price: "رایگان",
      badge: "زمان محدود",
      features: [
        "دسترسی به 500+ ویدیو",
        "زیرنویس تعاملی پیشرفته",
        "فضای نامحدود فلش‌کارت",
        "پشتیبانی اولویت‌دار",
        "بینش‌های مبتنی بر هوش مصنوعی",
        "پیگیری پیشرفت",
      ],
      highlighted: true,
    },
    {
      name: "نهایی",
      price: "رایگان",
      badge: "زمان محدود",
      features: [
        "دسترسی نامحدود به ویدیو",
        "محتوای انحصاری پریمیوم",
        "تجزیه و تحلیل پیشرفته هوش مصنوعی",
        "مسیرهای یادگیری شخصی‌سازی شده",
        "جلسات خصوصی تدریس",
        "درخواست‌های اولویت‌دار محتوا",
      ],
      highlighted: true,
    },
  ];

  const testimonials = [
    {
      name: "علی رضایی",
      role: "علاقه‌مند به زبان",
      content: "ده‌ها اپلیکیشن زبان را امتحان کرده‌ام، اما این پلتفرم متفاوت است. یادگیری از طریق فیلم‌ها و سریال‌های واقعی آن را طبیعی و لذت‌بخش می‌کند.",
      avatar: "ع",
    },
    {
      name: "سارا محمدی",
      role: "دانشجوی سینما",
      content: "زیرنویس‌های دو زبانه تعاملی یک تغییردهنده بازی هستند. می‌توانم فیلم‌های خارجی مورد علاقه‌ام را ببینم و همزمان مهارت‌های زبانی‌ام را بهبود دهم. فوق‌العاده است!",
      avatar: "س",
    },
    {
      name: "امیر حسینی",
      role: "دیجیتال نومد",
      content: "سیستم فلش‌کارت لایتنر یکپارچه با محتوای ویدیویی دقیقاً همان چیزی است که نیاز داشتم. در 3 ماه بیشتر از 3 سال مطالعه سنتی پیشرفت کرده‌ام.",
      avatar: "ا",
    },
  ];

  const subtitleWords = [
    { text: "سلام", translation: "Hello", clickable: true },
    { text: "،", translation: "", clickable: false },
    { text: "خوبی", translation: "How are you", clickable: true },
    { text: "؟", translation: "", clickable: false },
  ];

  const handleAddToFlashcard = (word) => {
    if (!addedWords.includes(word.text)) {
      setAddedWords([...addedWords, word.text]);
      // Show success message
      setTimeout(() => {
        // After 2 seconds, remove the word from the selected state
        setSelectedWord(null);
      }, 2000);
    }
  };

  const isWordAdded = (wordText) => {
    return addedWords.includes(wordText);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden" dir="rtl">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050505] to-black z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl animate-pulse"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
            <span className="relative flex h-3 w-3 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium text-blue-300">پیشنهاد زمان محدود</span>
          </div>

          {/* Main Title */}
          <h1 className="mb-6 text-5xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            زبان را از طریق
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              فیلم و سریال یاد بگیرید
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-10 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            روش انقلابی برای تسلط بر زبان‌ها. تماشا کنید، یاد بگیرید و به خاطر بسپارید با سیستم هوشمند ما.
          </p>

          {/* Free Offer Highlight */}
          {/* <div className="mb-10 p-6 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 backdrop-blur-sm max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <h2 className="text- md:text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                آماده تحول یادگیری زبان خود هستید؟
                </h2>
             <h5 className="text-gray-400 text-sm">
به 1000 کاربر اول بپیوندید که دسترسی پریمیوم را کاملاً رایگان دریافت می‌کنند.
                </h5>
            
              </div>
   
            </div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-400">ظرفیت رایگان باقی‌مانده</span>
              <span className="text-blue-400 font-bold">{remainingSpots}/1000</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${(remainingSpots / 1000) * 100}%` }}
              ></div>
            </div>
          </div> */}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:shadow-blue-600/40"
            >
              شروع یادگیری رایگان
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center rounded-xl border border-gray-700 bg-transparent px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/5 hover:border-gray-600"
            >
              مشاهده دمو
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>امتیاز 4.9/5</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>1,000+ زبان‌آموز فعال</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>مطابق با چارچوب اروپایی</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-600 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              ویژگی‌هایی که یادگیری را تسریع می‌کنند
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              پلتفرم ما تکنولوژی پیشرفته را با روش‌های اثبات‌شده یادگیری زبان ترکیب می‌کند
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-gradient-to-b from-gray-900/50 to-black border border-gray-800 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <div className="text-blue-400">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Video Section */}
      <section id="demo" className="py-20 px-6 bg-gradient-to-b from-[#050505] to-black">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
        تجربه یادگیری هرگز نشنیده
      </h2>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto">
        پخش‌کننده ویدیوی تعاملی ما تماشای منفعل را به یادگیری فعال تبدیل می‌کند
      </p>
    </div>
    
    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
      <div className="aspect-video bg-black relative font-mono">
        {/* Code Background Effect */}
        <div className="absolute inset-0 opacity-10 hidden md:block">
          <pre className="text-green-400 text-xs p-4">
{`const learnLanguage = {
  method: "interactive",
  content: "movies & series",
  features: [
    "bilingual subtitles",
    "clickable words", 
    "smart flashcards",
    "AI powered"
  ],
  result: "fluency"
}`}
          </pre>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10"></div>
        
        {/* Main Content Area */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-4">
            <div className="mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">پخش‌کننده هوشمند</h3>
              <p className="text-sm md:text-base text-gray-400">ویدیوهای تعاملی با زیرنویس دو زبانه</p>
            </div>
          </div>
        </div>
        
        {/* Interactive Subtitle Display */}
        <div className="absolute bottom-24 md:bottom-32 left-0 right-0 px-4 md:px-8 z-30">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 md:p-4 max-w-4xl mx-auto border border-gray-800">
            <div className="text-center mb-3">
              <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed">
                {subtitleWords.map((word, index) => (
                  <span
                    key={index}
                    className={`${word.clickable ? "cursor-pointer hover:text-blue-400 transition-colors duration-200" : ""} ${isWordAdded(word.text) ? "text-green-400" : ""}`}
                    onClick={() => word.clickable && setSelectedWord(word)}
                  >
                    {word.text}
                  </span>
                ))}
              </p>
              <p className="text-base md:text-lg lg:text-xl text-gray-300 mt-2 leading-relaxed">
                Hello, how are you today?
              </p>
              <p className="text-sm text-gray-500">افزودن لغات به فلش کارت با کلیک روی کلمه مورد نظر</p>
          
            </div>
          </div>
        </div>

        {/* Flashcard Box - Fixed Position for Mobile */}
        {selectedWord && (
          <div className="absolute top-4 md:top-auto md:bottom-40 left-4 right-4 z-40">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="text-center md:text-right flex-1">
                  <p className="text-white font-medium text-lg">"{selectedWord.text}"</p>
                  <p className="text-gray-300 text-sm">{selectedWord.translation} (انگلیسی)</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAddToFlashcard(selectedWord)}
                    className={`${
                      isWordAdded(selectedWord.text) 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white px-4 py-2 rounded text-sm transition-colors flex items-center`}
                  >
                    {isWordAdded(selectedWord.text) ? (
                      <>
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        افزوده شد
                      </>
                    ) : (
                      "افزودن به فلش‌ کارت"
                    )}
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Player Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 md:p-4 z-20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-blue-400 transition-colors duration-200"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <div className="w-24 md:w-64 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(currentTime / 402) * 100}%` }}
                ></div>
              </div>
              <span className="text-white text-xs md:text-sm whitespace-nowrap">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / 6:42
              </span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse">
              <button className="text-white hover:text-blue-400 transition-colors duration-200">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button className="text-white hover:text-blue-400 transition-colors duration-200">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center p-6 rounded-xl bg-gradient-to-b from-gray-900/50 to-black border border-gray-800">
        <div className="text-3xl font-bold text-blue-400 mb-2">100+</div>
        <div className="text-gray-400">ویدیوی پریمیوم</div>
      </div>
      <div className="text-center p-6 rounded-xl bg-gradient-to-b from-gray-900/50 to-black border border-gray-800">
        <div className="text-3xl font-bold text-purple-400 mb-2">10,000+</div>
        <div className="text-gray-400">کلمه تعاملی</div>
      </div>
      <div className="text-center p-6 rounded-xl bg-gradient-to-b from-gray-900/50 to-black border border-gray-800">
        <div className="text-3xl font-bold text-pink-400 mb-2">مبتنی بر هوش مصنوعی</div>
        <div className="text-gray-400">سیستم یادگیری</div>
      </div>
    </div>
  </div>
</section>
      {/* AI Insights Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              بینش‌های یادگیری مبتنی بر هوش مصنوعی
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              هوش مصنوعی پیشرفته ما الگوهای یادگیری شما را تحلیل می‌کند تا پیشرفت شما را بهینه کند
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-b from-gray-900/50 to-black border border-gray-800">
              <h3 className="text-2xl font-bold mb-6 text-white">پیشرفت یادگیری</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">واژگان</span>
                    <span className="text-blue-400">78%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">درک مطلب شنیداری</span>
                    <span className="text-purple-400">65%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">تسلط بر گرامر</span>
                    <span className="text-pink-400">52%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div className="bg-gradient-to-r from-pink-500 to-pink-400 h-3 rounded-full" style={{ width: "52%" }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-b from-gray-900/50 to-black border border-gray-800">
              <h3 className="text-2xl font-bold mb-6 text-white">تحلیل حفظ اطلاعات</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {[40, 65, 80, 75, 90].map((height, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">روز {index + 1}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm mt-5">نرخ حفظ کلمات در هفته گذشته</p>
            </div>
          </div>

          <div className="mt-8 p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2 text-white">توصیه هوش مصنوعی</h3>
                <p className="text-gray-400 max-w-2xl text-justify">
                  بر اساس الگوهای یادگیری شما، توصیه می‌کنیم در 7 روز آینده روی عبارات مکالمه تمرکز کنید. 
                  حفظ واژگان شما عالی است، اما کاربرد زمینه‌ای نیاز به بهبود دارد.
                </p>
              </div>
              <button className="mt-4 md:mt-0 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors duration-200">
                اعمال توصیه
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#050505] to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              سفر یادگیری خود را انتخاب کنید
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              همه پلان‌ها در حال حاضر برای 1000 کاربر اول رایگان هستند
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-gray-900/80 to-black border-blue-500/30 shadow-lg shadow-blue-500/10"
                    : "bg-gradient-to-b from-gray-900/50 to-black border-gray-800"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium text-white">
                      {plan.badge}
                    </div>
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                  </div>
                  {plan.price === "رایگان" && (
                    <p className="text-sm text-blue-400 mt-2">معمولاً 299 هزار تومان در ماه</p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 ml-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                href="/login"
                className=""
              >  <button
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >          
                  {plan.price === "رایگان" ? "شروع کنید" : "انتخاب پلان"}
                
           
                </button>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400">
              نیازی به کارت اعتباری نیست. هر زمان که بخواهید لغو کنید.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              پس از پیشنهاد زمان محدود، می‌توانید با پلان پولی ادامه دهید یا به پلان رایگان پایه ما تغییر دهید.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              زبان‌آموزان ما چه می‌گویند
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              به هزاران علاقه‌مند به زبان بپیوندید که تجربه یادگیری خود را متحول می‌کنند
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 rounded-2xl bg-gradient-to-b from-gray-900/50 to-black border border-gray-800">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold ml-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#050505] to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            آماده تحول یادگیری زبان خود هستید؟
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            به 1000 کاربر اول بپیوندید که دسترسی پریمیوم را کاملاً رایگان دریافت می‌کنند.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:shadow-blue-600/40"
            >
              جایگاه رایگان خود را بگیرید
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-gray-700 bg-transparent px-10 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/5 hover:border-gray-600"
            >
              اطلاعات بیشتر
            </Link>
          </div>
          <div className="mt-8 flex justify-center items-center">
            <div className="flex -space-x-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-black"></div>
              ))}
            </div>
            <p className="mr-4 text-gray-400">
              <span className="font-bold text-white">{1000 - remainingSpots}</span> نفر این هفته پیوستند
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className=" mb-8">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                پلتفرم زبانیون
              </h3>
              <p className="text-gray-400 text-sm">
              روش انقلابی برای یادگیری زبان از طریق فیلم و سریال، جعبه لایتنر و ...
              </p>
            </div>

          </div>
          <div className="pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 پلتفرم زبانیون. تمام حقوق محفوظ است.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}