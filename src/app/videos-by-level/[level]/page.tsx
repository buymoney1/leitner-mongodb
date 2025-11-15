// app/videos/level/[level]/page.tsx
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';

const prisma = new PrismaClient();

async function getVideosByLevel(level: string) {
  const videos = await prisma.video.findMany({
    where: { level: level as any },
    orderBy: { createdAt: 'desc' },
  });
  return videos;
}

export default async function LevelVideosPage({ params }: { params: Promise<{ level: string }> }) {
  // 1. params را await کنید
  const { level } = await params;

  // 2. از level استفاده کنید
  const videos = await getVideosByLevel(level);

  return (
    <main className="container mx-auto p-4">
      {/* 3. از level در JSX استفاده کنید */}
      <h1 className="text-3xl font-bold mb-6">Videos for Level: {level}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Link key={video.id} href={`/video/${video.id}`}>
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              {video.thumbnailUrl ? (
                <Image src={video.thumbnailUrl} alt={video.title} width={400} height={225} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">No Thumbnail</div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold">{video.title}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}