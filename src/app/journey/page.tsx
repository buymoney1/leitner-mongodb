// app/journey/page.tsx
import JourneyProgress from '@/components/planner/JourneyProgress';

export default function JourneyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* هدر صفحه */}
        <div className="mb-6 mt-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            🗺️ نقشه سفر یادگیری
          </h1>
          <p className=" text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            مسیر پیشرفت خود را مشاهده کنید و برای رسیدن به لول‌های بالاتر تلاش کنید.
            هر مرحله نشان‌دهنده پیشرفت شما در یادگیری زبان است.
          </p>
        </div>

        {/* بخش اصلی JourneyProgress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* کارت اصلی JourneyProgress */}
          <div className="lg:col-span-2">
            <JourneyProgress showAllLevels={true} />
          </div>

          {/* ستون سمت راست - اطلاعات تکمیلی */}
          <div className="space-y-6">
            {/* کارت اطلاعات سطح‌بندی */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                📊 نحوه محاسبه لول
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">هر 4 فعالیت</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">=</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">1 لول</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  فعالیت‌های روزانه شامل:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>تماشای ویدیو</li>
                    <li>گوش دادن به پادکست</li>
                    <li>مرور کلمات</li>
                    <li>مطالعه مقاله</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* کارت آمار */}
            <div className="mb-15 bg-gradient-to-br from-emerald-500/10 to-green-600/5 dark:from-emerald-500/20 dark:to-green-600/10 rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                🎯 نکات پیشرفت سریع
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>هر روز حداقل 2 فعالیت کامل کنید</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>برای 3 روز متوالی فعالیت داشته باشید</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>هفته‌ای 5 ویدیو تماشا کنید</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>روزانه 10 کلمه جدید یاد بگیرید</span>
                </li>
              </ul>
            </div>

         
          </div>
        </div>


      </div>
    </div>
  );
}