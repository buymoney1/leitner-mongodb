// components/planner/DailyGuide.tsx
'use client';

import { BookOpen, Headphones, Video, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function DailyGuide() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const guides = [
    {
      id: 'video',
      title: 'تماشای ویدیو آموزشی',
      description: 'روزانه حداقل یک ویدیو آموزشی در زمینه تخصصی خود تماشا کنید',
      icon: Video,
      color: 'bg-red-500/10 text-red-600 dark:text-red-400',
      steps: [
        'ویدیویی با موضوع مرتبط با اهداف یادگیری خود انتخاب کنید',
        'در حین تماشا لغات مهم و جدید رو به لایتنر خود اضافه کنید',
        'مدت زمان پیشنهادی: ۱۵-۳۰ دقیقه',
        'پس از اتمام، سه نکته کلیدی را مرور کنید'
      ]
    },
    {
      id: 'podcast',
      title: 'گوش دادن به پادکست',
      description: 'یک اپیزود پادکست در حین فعالیت‌های روزانه گوش دهید',
      icon: Headphones,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      steps: [
        'پادکستی در حوزه دلخواه انتخاب کنید',
        'لغات جدید رو به لایتنر خود اضافه کنید',
        'می‌توانید در حین رفت و آمد یا ورزش گوش دهید',
        'مدت زمان پیشنهادی: ۲۰-۴۵ دقیقه',
        'یک ایده جدید از پادکست استخراج کنید'
      ]
    },
    {
      id: 'words',
      title: 'مرور لغات در لایتنر',
      description: 'کلمات جدید را در سیستم لایتنر مرور و تثبیت کنید',
      icon: BookOpen,
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      steps: [
        'کارت‌های لغت روزانه را بررسی کنید',
        'کلمات مشکل‌دار را علامت‌گذاری کنید',
        'تعداد پیشنهادی: ۱۰-۲۰ کلمه جدید',
        'کلمات را در جمله به کار ببرید'
      ]
    },
    {
      id: 'article',
      title: 'مطالعه مقاله تخصصی',
      description: 'یک مقاله معتبر در حوزه کاری خود مطالعه کنید',
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      steps: [
        'مقاله‌ای را به دلخواه انتخاب کنید',
        'ابتدا چکیده و نتیجه‌گیری را بخوانید',
        'لغات جدید رو به لایتنر خود اضافه کنید',
        'مدت زمان پیشنهادی: ۱۰-۲۰ دقیقه'
      ]
    }
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            راهنمای گام به گام روزانه
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            دقیقا بدانید امروز باید چه کارهایی انجام دهید
          </p>
        </div>
      </div>

      <div className="space-y-4 ">
        {guides.map((guide) => {
          const Icon = guide.icon;
          const isExpanded = expandedSection === guide.id;
          
          return (
            <div 
              key={guide.id}
              className={`
                border rounded-xl transition-all duration-300 overflow-hidden
                ${isExpanded 
                  ? 'border-gray-300 dark:border-gray-600 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <button
                onClick={() => toggleSection(guide.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${guide.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 dark:text-white text-right">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-right">
                      {guide.description}
                    </p>
                  </div>
                </div>
                <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="space-y-3">
                    {guide.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        زمان تخمینی: ۶۰-۹۰ دقیقه
                      </span>
                      <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        شروع فعالیت →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              نکته مهم: کیفیت مهم‌تر از کمیت است
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              حتی اگر زمان کمی دارید، یکی از فعالیت‌ها را با تمرکز کامل انجام دهید
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}