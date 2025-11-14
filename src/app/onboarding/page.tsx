'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserCheck, Clock, Target, BookOpen } from 'lucide-react';

const REVIEW_TIME_OPTIONS = [
  { value: 'MORNING', label: 'صبح‌ها' },
  { value: 'AFTERNOON', label: 'بعد از ظهرها' },
  { value: 'EVENING', label: 'عصرها' },
  { value: 'NIGHT', label: 'شب‌ها' },
];

const LEARNING_GOALS = ['IELTS', 'TOEFL', 'GENERAL_ENGLISH', 'BUSINESS_ENGLISH'];

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
      title: 'نام خود را وارد کنید',
      icon: <UserCheck className="h-6 w-6 text-indigo-400" />,
      content: (
        <input
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="نام کامل شما"
          className="mt-4 w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      ),
      isValid: formData.name.trim() !== '',
    },
    {
      title: 'هدف یادگیری',
      icon: <BookOpen className="h-6 w-6 text-indigo-400" />,
      content: (
        <select
          name="learningGoal"
          value={formData.learningGoal}
          onChange={handleChange}
          className="mt-4 w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">انتخاب کنید</option>
          {LEARNING_GOALS.map(goal => (
            <option key={goal} value={goal}>{goal}</option>
          ))}
        </select>
      ),
      isValid: formData.learningGoal !== '',
    },
    {
      title: 'نمره هدف',
      icon: <Target className="h-6 w-6 text-indigo-400" />,
      content: isIELTSOrTOEFL ? (
        <input
          name="targetScore"
          type="number"
          step="0.5"
          value={formData.targetScore}
          onChange={handleChange}
          placeholder={formData.learningGoal === 'IELTS' ? 'مثلا: 7.0' : 'مثلا: 95'}
          className="mt-4 w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      ) : <p className="mt-4 text-gray-400">نیازی به نمره هدف نیست</p>,
      isValid: isIELTSOrTOEFL ? formData.targetScore.trim() !== '' : true,
    },
    {
      title: 'زمان مرور',
      icon: <Clock className="h-6 w-6 text-indigo-400" />,
      content: (
        <select
          name="reviewTimePreference"
          value={formData.reviewTimePreference}
          onChange={handleChange}
          className="mt-4 w-full px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="">انتخاب کنید</option>
          {REVIEW_TIME_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
        {/* Step Header */}
        <div className="flex items-center gap-2 mb-6">
          {steps[currentStep].icon}
          <h2 className="text-lg font-semibold text-white">{steps[currentStep].title}</h2>
        </div>

        {/* Step Content */}
        {steps[currentStep].content}

        {/* Progress Bar */}
        <div className="mt-6 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-2 bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl bg-gray-700 text-gray-300 disabled:opacity-50 hover:bg-gray-600 transition"
          >
            قبلی
          </button>
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!steps[currentStep].isValid}
              className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition disabled:opacity-50"
            >
              بعدی
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !steps[currentStep].isValid}
              className="px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50"
            >
              {isLoading ? 'در حال ذخیره...' : 'شروع یادگیری'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
