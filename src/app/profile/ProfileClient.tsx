'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Settings, Camera, Sun, Moon, Monitor, LogOut, MessageSquare, Mail, Phone, ExternalLink, Copy, HelpCircle } from 'lucide-react'
import { useTheme } from '../../../hooks/useTheme'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  name?: string | null
  email: string
  image?: string | null
  learningGoal?: string | null
  targetScore?: number | null
  suggestedReviewTime?: string | null
  isOnboardingComplete: boolean
  role: string
  createdAt: string
  _count: {
    books: number
    cards: number
    podcasts: number
    articles: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login')
    }
  }, [session, status, router])

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('خطا در دریافت پروفایل:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('system')
    } else {
      setTheme('dark')
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      })
      router.push('/login')
    } catch (error) {
      console.error('خطا در خروج از حساب:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleEmailClick = () => {
    const subject = encodeURIComponent("پشتیبانی اپلیکیشن یادگیری انگلیسی")
    const body = encodeURIComponent(`سلام،\n\nمن در مورد اپلیکیشن سوال/مشکل/پیشنهادی دارم:\n\n\n\n\n---\nبا تشکر`)
    window.open(`mailto:buymoney.10@gmail.com?subject=${subject}&body=${body}`, "_blank")
    toast.success("کلاینت ایمیل باز شد")
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("سلام، من از اپلیکیشن یادگیری انگلیسی درخواست پشتیبانی دارم.")
    window.open(`https://wa.me/989398351743?text=${message}`, "_blank")
    toast.success("واتساپ باز شد")
  }

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast.success(message)
  }

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-5 w-5" />
    if (theme === 'dark') return <Moon className="h-5 w-5" />
    if (theme === 'light') return <Sun className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  const getThemeLabel = () => {
    if (!mounted) return 'حالت سیستم'
    if (theme === 'dark') return 'حالت تیره'
    if (theme === 'light') return 'حالت روشن'
    return 'حالت سیستم'
  }

  const getThemeDescription = () => {
    if (!mounted) return 'پیروی از تنظیمات سیستم'
    if (theme === 'dark') return 'مناسب برای استفاده در شب'
    if (theme === 'light') return 'مناسب برای استفاده در روز'
    return 'پیروی از تنظیمات سیستم'
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بررسی احراز هویت...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">در حال انتقال به صفحه ورود...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">خطا در بارگذاری اطلاعات</p>
          <button 
            onClick={fetchProfile}
            className="px-6 py-2 bg-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 hover:bg-blue-700 dark:hover:from-blue-700 dark:hover:to-purple-700 rounded-xl transition-all duration-300 text-white"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }

  const MobileNavBar = () => (
    <div className={`fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t z-50 md:hidden ${
      theme === 'dark' 
        ? 'bg-gray-900/95 border-gray-800' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="flex justify-around items-center p-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'overview' 
              ? (theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-cyan-400'
                  : 'bg-blue-100 text-blue-600')
              : (theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-500 hover:text-gray-900')
          }`}
        >
          <User className="h-5 w-5 mb-1" />
          <span className="text-xs">پروفایل</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'settings' 
              ? (theme === 'dark'
                  ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-400'
                  : 'bg-green-100 text-green-600')
              : (theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-500 hover:text-gray-900')
          }`}
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-xs">تنظیمات</span>
        </button>
      </div>
    </div>
  )

  const LogoutButton = () => (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`w-full p-4 border rounded-xl transition-all duration-300 group ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-red-600/20 to-pink-600/20 border-red-500/30 hover:from-red-600/30 hover:to-pink-600/30'
          : 'bg-red-50 border-red-200 hover:bg-red-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
          }`}>
            <LogOut className={`h-5 w-5 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`} />
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900 dark:text-white">خروج از حساب</div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-red-300' : 'text-red-600'
            }`}>برای دسترسی مجدد وارد شوید</div>
          </div>
        </div>
        <div className={`p-2 rounded-lg ${
          theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
        } ${isLoggingOut ? 'animate-pulse' : ''}`}>
          <LogOut className={`h-4 w-4 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          } ${isLoggingOut ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
        </div>
      </div>
    </button>
  )

  const SupportCard = () => (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900/50 to-black border-gray-800 hover:border-blue-500/30'
        : 'bg-white border-gray-200 hover:border-blue-500/50'
    }`}>
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-rose-500/20 to-pink-500/20'
                : 'bg-rose-100'
            }`}>
              <MessageSquare className={`h-6 w-6 ${
                theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
              }`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">پشتیبانی و ارتباط</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">برای سوالات و مشکلات</p>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
          } transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCopy("buymoney.10@gmail.com", "آدرس ایمیل کپی شد")
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors group ${
              theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Mail className={`h-4 w-4 ${
              theme === 'dark' ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-600 group-hover:text-blue-600'
            }`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">ایمیل</span>
            <Copy className="h-3 w-3 text-gray-500" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCopy("09398351743", "شماره تلفن کپی شد")
            }}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors group ${
              theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Phone className={`h-4 w-4 ${
              theme === 'dark' ? 'text-gray-400 group-hover:text-green-400' : 'text-gray-600 group-hover:text-green-600'
            }`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">تلفن</span>
            <Copy className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={`border-t p-6 space-y-4 animate-slideDown ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div className={`rounded-xl p-4 ${
            theme === 'dark' 
              ? 'bg-blue-900/20 border border-blue-800' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start gap-2">
              <HelpCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <p className={`text-sm ${
                theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
              }`}>
                برای هرگونه سوال، مشکل فنی، پیشنهاد یا انتقاد با ما در ارتباط باشید. معمولاً در کمتر از ۲۴ ساعت پاسخ می‌دهیم.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleWhatsAppClick}
              className={`w-full p-4 rounded-xl transition-all duration-300 group ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold">ارسال از طریق واتساپ</div>
                    <div className="text-green-200 text-sm">پاسخ سریع‌تر</div>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <button
              onClick={handleEmailClick}
              className={`w-full p-4 rounded-xl transition-all duration-300 group ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="font-bold">ارسال از طریق ایمیل</div>
                    <div className="text-blue-200 text-sm">مناسب برای پیام‌های طولانی</div>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className={`min-h-screen text-gray-900 dark:text-white overflow-hidden ${
      theme === 'dark' ? 'bg-black' : 'bg-white'
    }`}>
      {/* Background Effects */}
      <div className="fixed inset-0">
        {theme === 'dark' ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-black via-[#050505] to-black"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-white"></div>
        )}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold bg-clip-text text-transparent ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-white via-gray-300 to-gray-500'
                  : 'bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600'
              }`}>
                پروفایل کاربری
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">مدیریت حساب و اطلاعات شخصی</p>
            </div>
            <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-gray-100 border-gray-300'
            }`}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{profile.role === 'admin' ? 'مدیر' : 'کاربر'}</span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 md:px-6 pb-24 md:pb-6 space-y-6 max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className={`border rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-900/50 to-black border-gray-800 hover:border-blue-500/30'
              : 'bg-white border-gray-200 hover:border-blue-500/50'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/30'
                    : 'bg-gray-100 border-cyan-500/50'
                }`}>
                  <span className="text-2xl font-light text-gray-900 dark:text-white">
                    {(profile.name || profile.email).charAt(0).toUpperCase()}
                  </span>
                </div>
         
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name || 'بدون نام'}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{profile.email}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">عضو از {new Date(profile.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{profile.role === 'user' ? 'کاربر' : 'مدیر'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Card */}
          <div className={`border rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-900/50 to-black border-gray-800 hover:border-amber-500/30'
              : 'bg-white border-gray-200 hover:border-amber-500/50'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20'
                    : 'bg-amber-100'
                }`}>
                  {getThemeIcon()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">تم نمایش</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{getThemeDescription()}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`text-xs px-3 py-2 border rounded-xl transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-500/30 hover:from-amber-600/30 hover:to-orange-600/30 text-amber-400 hover:text-amber-300'
                    : 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-700 hover:text-amber-800'
                }`}
              >
                <span className="hidden md:inline">تغییر به </span>
                {getThemeLabel()}
              </button>
            </div>
            <div className={`rounded-xl p-4 border ${
              theme === 'dark'
                ? 'bg-amber-500/5 border-amber-500/10'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <p className={`text-sm text-center ${
                theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
              }`}>
                حالت فعلی: <strong className={`${
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-800'
                }`}>{getThemeLabel()}</strong>
              </p>
            </div>
          </div>

          {/* Support Card */}
          <SupportCard />

          {/* Logout Card */}
          <div className={`border rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-900/50 to-black border-gray-800 hover:border-red-500/30'
              : 'bg-white border-gray-200 hover:border-red-500/50'
          }`}>
            <LogoutButton />
          </div>
        </div>
      </div>

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
  )
}