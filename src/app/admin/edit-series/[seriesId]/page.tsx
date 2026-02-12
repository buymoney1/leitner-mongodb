// app/admin/edit-series/[seriesId]/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SeriesUploadForm from '@/components/video/SeriesUploadForm';
import { use } from 'react';

interface EditSeriesPageProps {
  params: Promise<{
    seriesId: string;
  }>;
}

export default function EditSeriesPage({ params }: EditSeriesPageProps) {
  // استفاده از React.use برای unwrap کردن params
  const { seriesId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    router.push('/');
    return null;
  }

  const handleSuccess = () => {
    console.log('Series updated successfully');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <SeriesUploadForm seriesId={seriesId} onSuccess={handleSuccess} />
    </div>
  );
}