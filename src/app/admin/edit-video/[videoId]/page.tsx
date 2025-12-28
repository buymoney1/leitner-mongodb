// app/admin/edit-video/[videoId]/page.tsx

import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '../../../../../lib/server-auth';
import AdminVideoEditForm from '@/components/video/AdminVideoEditForm';

const prisma = new PrismaClient();

async function getVideoById(videoId: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        vocabularies: true
      }
    });
    return video;
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}

export default async function EditVideoPage({ 
  params 
}: { 
  params: Promise<{ videoId: string }> 
}) {
  const { videoId } = await params;
  
  // Check authentication and admin role
  const session = await getAuthSession();
  
  if (!session?.user?.id || session.user.role !== 'admin') {
    redirect('/login');
  }
  
  // Fetch video data
  const video = await getVideoById(videoId);
  
  if (!video) {
    notFound();
  }
  
  return (
    <main className="container mx-auto p-4">
      <AdminVideoEditForm video={video} />
    </main>
  );
}