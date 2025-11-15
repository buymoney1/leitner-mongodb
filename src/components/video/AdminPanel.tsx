// components/AdminPanel.tsx
import Link from 'next/link';
import { Settings, Upload } from 'lucide-react';

export function AdminPanel() {
  return (
    <section className="mb-8 p-4 border border-red-500/50 bg-red-900/20 rounded-lg">
      <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5" />
        پنل ادمین
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/upload-video" aria-label="آپلود ویدیو جدید">
          <div className="flex items-center justify-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg hover:shadow-red-500/50 transition-transform hover:scale-105">
            <Upload className="h-5 w-5 text-red-400" />
            <span>آپلود ویدیو جدید</span>
          </div>
        </Link>
        {/* می‌توانید لینک‌های مدیریتی دیگر را اینجا اضافه کنید */}
      </div>
    </section>
  );
}