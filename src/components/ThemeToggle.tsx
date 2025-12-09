// components/SupportCard.tsx
"use client";

import { useState } from "react";
import { MessageSquare, Mail, Phone, ExternalLink, Copy, HelpCircle, MessageCircle } from "lucide-react";
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
    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/5 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">پشتیبانی و ارتباط</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              برای سوالات، مشکلات و پیشنهادات
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors text-sm"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:block">ارتباط با پشتیبانی</span>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          {/* Quick Contact Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCopy("buymoney.10@gmail.com", "آدرس ایمیل کپی شد")}
              className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-colors group"
            >
              <Mail className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">کپی ایمیل</span>
              <Copy className="h-3 w-3 text-purple-500" />
            </button>
            
            <button
              onClick={() => handleCopy("09398351743", "شماره تلفن کپی شد")}
              className="flex items-center justify-center gap-2 p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-colors group"
            >
              <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">کپی شماره</span>
              <Copy className="h-3 w-3 text-purple-500" />
            </button>
          </div>

          {/* Description */}
          <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                معمولاً در کمتر از ۲۴ ساعت پاسخ می‌دهیم. برای ارتباط سریع‌تر از واتساپ استفاده کنید.
              </p>
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl transition-all duration-300 group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="font-bold">ارسال از طریق واتساپ</div>
                  <div className="text-green-100 text-sm">پاسخ سریع‌تر</div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>

            {/* Email */}
            <button
              onClick={handleEmailClick}
              className="w-full p-4 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white rounded-xl transition-all duration-300 group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="font-bold">ارسال از طریق ایمیل</div>
                  <div className="text-blue-100 text-sm">پیام‌های طولانی و فایل</div>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Contact Details */}
          <div className="bg-purple-500/5 rounded-lg p-3 border border-purple-500/10">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
              <Phone className="h-3 w-3" />
              اطلاعات تماس
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">ایمیل:</span>
                <code className="font-mono text-gray-800 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded">
                  buymoney.10@gmail.com
                </code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">واتساپ:</span>
                <code className="font-mono text-gray-800 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded">
                  ۰۹۳۹۸۳۵۱۷۴۳
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}