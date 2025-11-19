//onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserCheck, Clock, Target, BookOpen, Sparkles } from 'lucide-react';

const REVIEW_TIME_OPTIONS = [
  { value: 'MORNING', label: 'صبح‌ها ☀️', time: '۸-۱۲' },
  { value: 'AFTERNOON', label: 'بعد از ظهرها 🌤️', time: '۱۲-۱۶' },
  { value: 'EVENING', label: 'عصرها 🌙', time: '۱۶-۲۰' },
  { value: 'NIGHT', label: 'شب‌ها 🌙', time: '۲۰-۲۴' },
];

const LEARNING_GOALS = [
  { value: 'IELTS', label: 'آیلتس 🎯', description: 'آمادگی برای آزمون آیلتس' },
  { value: 'TOEFL', label: 'تافل 📝', description: 'آمادگی برای آزمون تافل' },
  { value: 'GENERAL_ENGLISH', label: 'انگلیسی عمومی 💬', description: 'مکالمه روزمره' },
  { value: 'BUSINESS_ENGLISH', label: 'انگلیسی تجاری 💼', description: 'زبان کسب و کار' },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    learningGoal: '',
    targetScore: '',
    reviewTimePreference: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (session?.user?.name) setFormData(prev => ({ ...prev, name: session.user.name || '' }));
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isIELTSOrTOEFL = formData.learningGoal === 'IELTS' || formData.learningGoal === 'TOEFL';

  const steps = [
    {
      title: 'خوش آمدید! نامتان چیست؟',
      icon: <UserCheck className="h-6 w-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            نام شما در پروفایل و گزارش‌ها نمایش داده می‌شود
          </p>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="مثلاً: علی محمدی"
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            autoFocus
          />
        </div>
      ),
      isValid: formData.name.trim().length >= 2,
    },
    {
      title: 'هدف یادگیری شما چیست؟',
      icon: <BookOpen className="h-6 w-6" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            هدف خود را برای شخصی‌سازی تجربه یادگیری انتخاب کنید
          </p>
          <div className="grid gap-3">
            {LEARNING_GOALS.map(goal => (
              <button
                key={goal.value}
                onClick={() => setFormData(prev => ({ ...prev, learningGoal: goal.value }))}
                className={`p-4 rounded-xl border-2 text-right transition-all duration-300 ${
                  formData.learningGoal === goal.value
                    ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/10 shadow-lg shadow-blue-500/20'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/30 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">{goal.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{goal.description}</div>
              </button>
            ))}
          </div>
        </div>
      ),
      isValid: formData.learningGoal !== '',
    },
    {
      title: 'نمره هدف شما چقدر است؟',
      icon: <Target className="h-6 w-6" />,
      content: isIELTSOrTOEFL ? (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            {formData.learningGoal === 'IELTS' 
              ? 'نمره هدف خود در آیلتس را وارد کنید (۰-۹)' 
              : 'نمره هدف خود در تافل را وارد کنید (۰-۱۲۰)'}
          </p>
          <input
            name="targetScore"
            type="number"
            step="0.5"
            min="0"
            max={formData.learningGoal === 'IELTS' ? "9" : "120"}
            value={formData.targetScore}
            onChange={handleChange}
            placeholder={formData.learningGoal === 'IELTS' ? 'مثلاً: ۷.۵' : 'مثلاً: ۱۰۰'}
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 backdrop-blur-sm text-center text-lg"
            autoFocus
          />
  
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-green-500 dark:text-green-400 text-4xl mb-2">🎯</div>
          <p className="text-gray-600 dark:text-gray-400">برنامه یادگیری شما بر اساس هدف انتخاب شده تنظیم خواهد شد</p>
        </div>
      ),
      isValid: isIELTSOrTOEFL ? formData.targetScore.trim() !== '' : true,
    },
    {
      title: 'ترجیح می‌دهید چه زمانی مرور کنید؟',
      icon: <Clock className="h-6 w-6" />,
      content: (
        <div className="space-y-3">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
            زمان مناسب برای مرور و یادگیری را انتخاب کنید
          </p>
          <div className="grid gap-3">
            {REVIEW_TIME_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setFormData(prev => ({ ...prev, reviewTimePreference: option.value }))}
                className={`p-4 rounded-xl border-2 text-right transition-all duration-300 ${
                  formData.reviewTimePreference === option.value
                    ? 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/10 shadow-lg shadow-purple-500/20'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800/30 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-200 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                    {option.time}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ),
      isValid: formData.reviewTimePreference !== '',
    },
  ];

  const handleNext = () => {
    if (steps[currentStep].isValid) {
      setCurrentStep(step => Math.min(step + 1, steps.length - 1));
    }
  };

  const handlePrev = () => setCurrentStep(step => Math.max(step - 1, 0));

  const handleSubmit = async () => {
    if (!steps[currentStep].isValid) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetScore: formData.targetScore ? parseFloat(formData.targetScore) : null,
          suggestedReviewTime: formData.reviewTimePreference,
        }),
      });
      if (response.ok) router.push('/dashboard');
      else alert('خطایی در ثبت اطلاعات رخ داد.');
    } catch {
      alert('خطا در ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300 px-4 py-8 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      <div className="fixed top-1/4 -left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-1/4 -right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md max-h-[95vh] overflow-y-auto scrollbar-hide">


        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800/50 rounded-3xl p-6 shadow-xl dark:shadow-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-xl transition-colors duration-300">
          {/* Step Header */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-gray-100 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
              {steps[currentStep].icon}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 text-right">
              {steps[currentStep].title}
            </h2>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {steps[currentStep].content}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm transition-colors duration-300">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/25"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600/50 transition-all duration-300 border border-gray-300 dark:border-gray-600 disabled:border-gray-400 dark:disabled:border-gray-700 backdrop-blur-sm font-medium"
            >
              قبلی
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!steps[currentStep].isValid}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:shadow-none font-medium backdrop-blur-sm"
              >
                بعدی
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !steps[currentStep].isValid}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:shadow-none font-medium backdrop-blur-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    در حال ذخیره...
                  </span>
                ) : (
                  'شروع سفر یادگیری 🚀'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6 pb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-blue-500 w-6'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-400 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}