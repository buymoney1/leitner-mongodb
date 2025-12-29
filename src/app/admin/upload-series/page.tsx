// app/admin/upload-series/page.tsx

import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../../lib/server-auth';
import SeriesUploadForm from '@/components/video/SeriesUploadForm';

export default async function UploadSeriesPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }
  
  return (
    <main className="container mx-auto p-4">
      <SeriesUploadForm />
    </main>
  );
}