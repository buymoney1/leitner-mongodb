// components/AdminPanel.tsx
import Link from 'next/link';
import { Settings, Upload, Users, Database, Shield, BarChart3 } from 'lucide-react';

export function AdminPanel() {
  const adminFeatures = [
    {
      icon: Upload,
      title: "آپلود ویدیو جدید",
      description: "بارگذاری ویدیوهای آموزشی جدید",
      href: "/admin/upload-video",
      color: "from-red-500 to-pink-600",
      iconColor: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-500/10 dark:bg-red-500/20",
      borderColor: "border-red-500/20 dark:border-red-500/30"
    },
    {
      icon: Database,
      title: "مدیریت محتوا",
      description: "مدیریت ویدیوها و دسته‌بندی‌ها",
      href: "/admin/content",
      color: "from-blue-500 to-cyan-600",
      iconColor: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      borderColor: "border-blue-500/20 dark:border-blue-500/30"
    },
    {
      icon: Users,
      title: "مدیریت کاربران",
      description: "مشاهده و مدیریت کاربران سیستم",
      href: "/admin/users",
      color: "from-green-500 to-emerald-600",
      iconColor: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-500/10 dark:bg-green-500/20",
      borderColor: "border-green-500/20 dark:border-green-500/30"
    },
    {
      icon: BarChart3,
      title: "آمار و گزارشات",
      description: "گزارشات کامل از عملکرد سیستم",
      href: "/admin/analytics",
      color: "from-purple-500 to-violet-600",
      iconColor: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      borderColor: "border-purple-500/20 dark:border-purple-500/30"
    },
    {
      icon: Shield,
      title: "تنظیمات امنیتی",
      description: "تنظیمات دسترسی و امنیت",
      href: "/admin/security",
      color: "from-amber-500 to-orange-600",
      iconColor: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
      borderColor: "border-amber-500/20 dark:border-amber-500/30"
    },
    {
      icon: Settings,
      title: "تنظیمات سیستم",
      description: "تنظیمات پیشرفته پلتفرم",
      href: "/admin/settings",
      color: "from-gray-500 to-slate-600",
      iconColor: "text-gray-500 dark:text-gray-400",
      bgColor: "bg-gray-500/10 dark:bg-gray-500/20",
      borderColor: "border-gray-500/20 dark:border-gray-500/30"
    }
  ];

  return (
    <section className="mb-8 p-6 rounded-2xl bg-white dark:bg-gray-900/80 bg-gradient-to-br from-gray-50/80 to-white/60 dark:from-gray-900/80 dark:to-gray-800/60 backdrop-blur-xl border border-gray-300 dark:border-gray-700/50 shadow-lg dark:shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_50%,transparent_75%)] dark:bg-[linear-gradient(45deg,transparent_25%,rgba(239,68,68,0.03)_50%,transparent_75%)] bg-[size:20px_20px]"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500/20 to-pink-600/20 dark:from-red-500/20 dark:to-pink-600/20 rounded-xl border border-red-500/30 dark:border-red-500/30">
            <Settings className="h-6 w-6 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent">
              پنل مدیریت
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              دسترسی به ابزارهای مدیریتی پیشرفته
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 dark:border-red-500/30 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-600 dark:text-red-400 text-sm font-medium">
            دسترسی ادمین
          </span>
        </div>
      </div>

      {/* Admin Features Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminFeatures.map((feature, index) => (
          <Link key={index} href={feature.href} className="block group">
            <div className={`relative overflow-hidden rounded-xl border ${feature.borderColor} bg-white/50 dark:bg-gray-800/50 bg-gradient-to-br from-white/60 to-gray-50/40 dark:from-gray-800/50 dark:to-gray-900/30 p-5 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl dark:group-hover:shadow-2xl h-full`}>
              
              {/* Hover Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${feature.bgColor} border ${feature.borderColor}`}>
                    <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 dark:from-gray-500 dark:to-gray-700 group-hover:from-current group-hover:to-current transition-colors"></div>
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg leading-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover Effects */}
              <div className={`absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              
              {/* Animated Border */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
                <div className="absolute inset-[1px] rounded-xl bg-white dark:bg-gray-900"></div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="relative z-10 mt-6 pt-4 border-t border-gray-300 dark:border-gray-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              سیستم فعال
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              آخرین بروزرسانی: امروز
            </span>
          </div>
          <span className="text-gray-600 dark:text-gray-400">دسترسی سطح ادمین</span>
        </div>
      </div>
    </section>
  );
}