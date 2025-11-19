'use client'

import { useState } from 'react'

interface UserProfile {
  id: string
  name?: string | null
  email: string
  learningGoal?: string | null
  targetScore?: number | null
  suggestedReviewTime?: string | null
}

interface ProfileFormProps {
  profile: UserProfile | null
  isEditing: boolean
  onSave: () => void
  onCancel: () => void
}

export default function ProfileForm({ profile, isEditing, onSave, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    learningGoal: profile?.learningGoal || '',
    targetScore: profile?.targetScore?.toString() || '',
    suggestedReviewTime: profile?.suggestedReviewTime || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // اگر profile وجود نداشته باشد، loading نمایش می‌دهیم
  if (!profile) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-400">در حال بارگذاری اطلاعات...</div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSave()
        onCancel()
      }
    } catch (error) {
      console.error('خطا در بروزرسانی پروفایل:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-400 font-light text-sm">نام نمایشی</label>
            <p className="text-white font-light mt-1">{profile.name || 'تنظیم نشده'}</p>
          </div>
          <div>
            <label className="text-gray-400 font-light text-sm">ایمیل</label>
            <p className="text-white font-light mt-1">{profile.email}</p>
          </div>
          <div>
            <label className="text-gray-400 font-light text-sm">هدف یادگیری</label>
            <p className="text-white font-light mt-1">{profile.learningGoal || 'تنظیم نشده'}</p>
          </div>
          <div>
            <label className="text-gray-400 font-light text-sm">نمره هدف</label>
            <p className="text-white font-light mt-1">
              {profile.targetScore ? `${profile.targetScore}%` : 'تنظیم نشده'}
            </p>
          </div>
          <div>
            <label className="text-gray-400 font-light text-sm">زمان مرور پیشنهادی</label>
            <p className="text-white font-light mt-1 capitalize">
              {profile.suggestedReviewTime === 'MORNING' && 'صبح'}
              {profile.suggestedReviewTime === 'AFTERNOON' && 'ظهر'}
              {profile.suggestedReviewTime === 'EVENING' && 'عصر'}
              {profile.suggestedReviewTime === 'NIGHT' && 'شب'}
              {!profile.suggestedReviewTime && 'تنظیم نشده'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-gray-400 font-light text-sm mb-2 block">نام نمایشی</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white font-light focus:outline-none focus:border-cyan-400/50 transition-colors"
            placeholder="نام خود را وارد کنید"
          />
        </div>

        <div>
          <label className="text-gray-400 font-light text-sm mb-2 block">نمره هدف (%)</label>
          <input
            type="number"
            name="targetScore"
            value={formData.targetScore}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.1"
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white font-light focus:outline-none focus:border-cyan-400/50 transition-colors"
            placeholder="نمره هدف را وارد کنید"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-gray-400 font-light text-sm mb-2 block">هدف یادگیری</label>
          <textarea
            name="learningGoal"
            value={formData.learningGoal}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white font-light focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
            placeholder="اهداف یادگیری خود را توصیف کنید..."
          />
        </div>

        <div>
          <label className="text-gray-400 font-light text-sm mb-2 block">زمان مرور پیشنهادی</label>
          <select
            name="suggestedReviewTime"
            value={formData.suggestedReviewTime}
            onChange={handleChange}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white font-light focus:outline-none focus:border-cyan-400/50 transition-colors"
          >
            <option value="">انتخاب زمان</option>
            <option value="MORNING">صبح</option>
            <option value="AFTERNOON">ظهر</option>
            <option value="EVENING">عصر</option>
            <option value="NIGHT">شب</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-xl font-medium hover:from-cyan-300 hover:to-blue-400 transition-all disabled:opacity-50"
        >
          {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3 border border-gray-600 text-gray-300 rounded-xl font-light hover:border-gray-500 hover:text-white transition-all"
        >
          انصراف
        </button>
      </div>
    </form>
  )
}