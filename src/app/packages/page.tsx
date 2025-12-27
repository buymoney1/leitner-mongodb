// app/packages/page.js

import Link from 'next/link';

export const metadata = {
  title: 'پکیج‌های اشتراکی',
  description: 'انتخاب پکیج اشتراکی مناسب بر اساس مدت زمان',
};

const packages = [
    {
      id: 1,
      name: 'پکیج یک ماهه',
      duration: 'یک ماه',
      price: '۱۹۸,۰۰۰ تومان',
      originalPrice: '۲۵۰,۰۰۰ تومان',
      discount: '۲۱٪',
      popular: false,
      monthlyPrice: '۱۹۸,۰۰۰ تومان',
    },
    {
      id: 2,
      name: 'پکیج سه ماهه',
      duration: 'سه ماه',
      price: '۵۴۰,۰۰۰ تومان', // 180,000 × 3
      originalPrice: '۷۵۰,۰۰۰ تومان',
      discount: '۲۸٪',
      popular: true,
      monthlyPrice: '۱۸۰,۰۰۰ تومان', // 540,000 ÷ 3
    },
    {
      id: 3,
      name: 'پکیج شش ماهه',
      duration: 'شش ماه',
      price: '۹۹۰,۰۰۰ تومان', // 165,000 × 6
      originalPrice: '۱,۵۰۰,۰۰۰ تومان',
      discount: '۳۴٪',
      popular: false,
      monthlyPrice: '۱۶۵,۰۰۰ تومان', // 990,000 ÷ 6
    },
  ];

const features = [
  'دسترسی کامل به تمام دوره‌های آموزشی',
  'یادگیری از محتوای واقعی',
  'زیرنویس دو زبانه تعاملی',
  'سیستم هوشمند لایتنر',
  'یادگیری مبتنی بر هوش مصنوعی',
  'محتوای سطح‌بندی شده',
  'قابلیت افزودن یادداشت های شخصی',
  'گوش دادن به پادکست های آموزشی',
  'یادگیری زبان از طریق آهنگ های روز دنیا',
  'لغات های کتاب های مطرح آموزش زبان',
  'مطالعه مقاله های سطح بندی شده',
  'یادگیری گرامر زبان',
  'پلنر حرفه ای و آمار دقیق یادگیری',
  'دسترسی به آپدیت‌های دوره‌ها به صورت رایگان',
  'پشتیبانی تخصصی (پاسخ‌گویی در ۲۴ ساعت کاری)',

];

export default function PackagesPage() {
  return (
    <div className=" text-gray-900 dark:text-white transition-colors duration-300">
      {/* هدر */}
      <header className="py-12 px-6 text-center  dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          پلن‌های اشتراک
          </h1>

        </div>
      </header>

      {/* بخش پکیج‌ها */}
      <section className=" py-10 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] ${
                  pkg.popular
                    ? 'border-blue-400 dark:border-blue-500 shadow-2xl shadow-blue-200 dark:shadow-blue-500/20'
                    : 'border-gray-300 dark:border-gray-800'
                } ${pkg.popular ? 'bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-black' : 'bg-white dark:bg-gray-800'}`}
              >
                {/* نشانگر محبوب */}
                {pkg.popular && (
                  <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white text-center py-1 font-bold text-xs">
                    پرفروش‌ترین
                  </div>
                )}

                <div className={`p-8 ${pkg.popular ? 'pt-12' : 'pt-8'}`}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">
                      {pkg.name}
                    </h3>
                   
                    {/* مدت زمان */}
                    <div className="bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">مدت زمان دسترسی</div>
                          <div className="mt-2 text-xl font-bold text-gray-800 dark:text-white">{pkg.duration}</div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* قیمت */}
                    <div className="mb-8 text-center">
  {/* قیمت اصلی با خط قرمز خورده - بالا و کوچک */}
  {pkg.originalPrice && (
    <div className="mb-2">
      <div className="relative inline-block">
        <span className="text-gray-400 dark:text-gray-500 line-through text-sm">
          {pkg.originalPrice}
        </span>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-400 dark:bg-red-500 transform -translate-y-1/2"></div>
      </div>
    </div>
  )}
  
  {/* قیمت فعلی - بزرگ و برجسته */}
  <div className="flex items-baseline justify-center mb-3">
    <span className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
      {pkg.price}
    </span>
  </div>
  
  {/* قیمت ماهیانه و تخفیف در یک راستا */}
  <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
    <div className="text-center">
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        قیمت ماهیانه
      </div>
      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
        {pkg.monthlyPrice}
      </div>
    </div>
    
    {pkg.discount && (
      <div className="text-center">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          صرفه‌جویی
        </div>
        <div className="text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full">
          {pkg.discount}
        </div>
      </div>
    )}
  </div>
</div>

                    <Link href={`/checkout?package=${pkg.id}`}>
                      <button
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-500/30`}
                      >
                        {pkg.popular ? 'انتخاب پکیج محبوب' : 'انتخاب این پکیج'}
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* جدول مقایسه قیمت */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
              مقایسه قیمت‌ها
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-300 dark:border-gray-700">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-right text-lg font-bold text-gray-800 dark:text-white">پکیج</th>
                    <th className="px-6 py-4 text-center text-lg font-bold text-gray-800 dark:text-white">مدت زمان</th>
                    <th className="px-6 py-4 text-center text-lg font-bold text-gray-800 dark:text-white">قیمت با تخفیف</th>
                    <th className="px-6 py-4 text-center text-lg font-bold text-gray-800 dark:text-white">تخفیف</th>
                    <th className="px-6 py-4 text-center text-lg font-bold text-gray-800 dark:text-white">ماهیانه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-right font-medium text-gray-800 dark:text-gray-200">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ml-2 ${pkg.popular ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                          {pkg.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{pkg.duration}</td>
                      <td className="px-6 py-4 text-center text-xl font-bold text-gray-800 dark:text-white">{pkg.price}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${pkg.popular ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-green-700 dark:text-green-400'}`}>
                          {pkg.discount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-green-600 dark:text-green-400 font-semibold">
                        {pkg.monthlyPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* بخش ویژگی‌های مشترک */}
      <section className="py-16 px-6 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              ویژگی‌های مشترک تمام پکیج‌ها
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
              تمام امکانات زیر در هر سه پکیج به صورت کامل ارائه می‌شوند
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors shadow-sm dark:shadow-none"
              >
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center ml-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
                      {feature}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* دسته‌بندی ویژگی‌ها */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/10 mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">محتوای آموزشی</h3>
              <p className="text-gray-500 dark:text-gray-400">دوره‌های کامل با کیفیت بالا</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-900/10 mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">پشتیبانی</h3>
              <p className="text-gray-500 dark:text-gray-400">تیم پشتیبانی اختصاصی</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-900/10 mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">پرداخت ایمن</h3>
              <p className="text-gray-500 dark:text-gray-400">پرداخت‌ها تحت محافظت SSL </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-900/10 mb-4">
                <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">تمرین عملی</h3>
              <p className="text-gray-500 dark:text-gray-400">پروژه‌های واقعی و کاربردی</p>
            </div>
          </div>
        </div>
      </section>

      {/* سوالات متداول */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            سوالات متداول
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'آیا ویژگی‌ها در پکیج‌های مختلف تفاوت دارد؟',
                a: 'خیر، تمام ویژگی‌ها در هر سه پکیج یکسان است. تنها تفاوت در مدت زمان دسترسی و قیمت می‌باشد.'
              },
              {
                q: 'آیا می‌توانم پکیج خود را ارتقا دهم؟',
                a: 'بله، در هر زمان می‌توانید پکیج خود را به پکیج با مدت زمان بیشتر ارتقا دهید و فقط مابه‌تفاوت را پرداخت کنید.'
              },
              {
                q: 'آیا امکان تمدید وجود دارد؟',
                a: 'بله، پس از اتمام مدت زمان پکیج، می‌توانید آن را تمدید کنید. همچنین در صورت تمدید زودتر از موعد، تخفیف ویژه دریافت خواهید کرد.'
              },
              {
                q: 'چرا پکیج طولانی‌تر اقتصادی‌تر است؟',
                a: 'در پکیج‌های با مدت زمان بیشتر، تخفیف بیشتری اعمال شده است تا برای افرادی که قصد یادگیری بلندمدت دارند، مقرون‌به‌صرفه‌تر باشد.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-gray-800/30 transition-all"
              >
                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">

            <div className="inline-flex items-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-500/20 rounded-xl px-6 py-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">
                تمام پرداخت‌ها تحت محافظت SSL امن هستند
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* اطلاعات تماس */}
      <footer className="py-12 px-6 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
  <div className="max-w-7xl mx-auto text-center">
    <div className="text-center py-8">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl text-gray-500 dark:text-gray-400 mb-2">
        نیاز به مشاوره دارید؟
      </h3>
 
      
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 max-w-md mx-auto">
  
        
        {/* دکمه واتساپ - با شماره شما */}
        <a 
          href="https://wa.me/989398351743?text=سلام%20👋%0Aدر%20مورد%20پکیج%20های%20اشتراکی%20سوال%20دارم%20لطفا%20راهنمایی%20کنید."
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
          </svg>
          واتساپ
        </a>
      </div>
      
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
       <p>پاسخ‌گویی ۲۴ ساعته</p>
       <p className="mt-4 text-gray-400 dark:text-gray-500 mb-8 max-w-2xl mx-auto">
        کارشناسان ما از طریق تلفن و واتساپ آماده پاسخگویی به سوالات شما در مورد پکیج‌های اشتراکی هستند
      </p>
      </div>
    </div>
    
    <div className="mb-8 border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
      <p className="text-gray-400 dark:text-gray-500 text-sm">
        © {new Date().getFullYear()} تمامی حقوق محفوظ است.
      </p>
    </div>
  </div>
</footer>
    </div>
  );
}