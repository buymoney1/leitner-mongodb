// components/SupportCard.tsx
"use client";

import { useState } from "react";
import { MessageSquare, Mail, Phone, ExternalLink, Copy, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export function SupportCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEmailClick = () => {
    const subject = encodeURIComponent("پشتیبانی اپلیکیشن یادگیری انگلیسی");
    const body = encodeURIComponent(`سلام،\n\nمن در مورد اپلیکیشن سوال/مشکل/پیشنهادی دارم:\n\n\n\n\n---\nبا تشکر`);
    window.open(`mailto:buymoney.10@gmail.com?subject=${subject}&body=${body}`, "_blank");
    toast.success("کلاینت ایمیل باز شد");
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("سلام، من از اپلیکیشن یادگیری انگلیسی درخواست پشتیبانی دارم.");
    window.open(`https://wa.me/989398351743?text=${message}`, "_blank");
    toast.success("واتساپ باز شد");
  };

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Card Header */}
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-xl">
              <MessageSquare className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">پشتیبانی و ارتباط</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">برای سوالات و مشکلات</p>
            </div>
          </div>
          <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Quick Contact Info (Always Visible) */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy("buymoney.10@gmail.com", "آدرس ایمیل کپی شد");
            }}
            className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <Mail className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">ایمیل</span>
            <Copy className="h-3 w-3 text-gray-500" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy("09398351743", "شماره تلفن کپی شد");
            }}
            className="flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <Phone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">تلفن</span>
            <Copy className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-5 space-y-4 animate-slideDown">
          {/* Description */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                برای هرگونه سوال، مشکل فنی، پیشنهاد یا انتقاد با ما در ارتباط باشید. معمولاً در کمتر از ۲۴ ساعت پاسخ می‌دهیم.
              </p>
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold">ارسال از طریق واتساپ</div>
                    <div className="text-green-100 text-sm">پاسخ سریع‌تر</div>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailClick}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold">ارسال از طریق ایمیل</div>
                    <div className="text-blue-100 text-sm">مناسب برای پیام‌های طولانی</div>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          {/* Contact Details */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              اطلاعات تماس
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">ایمیل:</span>
                <code className="text-sm font-mono text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  buymoney.10@gmail.com
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">واتساپ:</span>
                <code className="text-sm font-mono text-gray-800 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  ۰۹۳۹۸۳۵۱۷۴۳
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}