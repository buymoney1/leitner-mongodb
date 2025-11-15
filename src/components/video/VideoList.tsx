// components/VideoList.tsx
import Link from 'next/link';
import { VideoCard } from './VideoCard';

interface Video {
  id: string;
  title: string;
  thumbnailUrl: string | null;
}

interface VideoListProps {
  title: string;
  videos: Video[];
  seeAllHref: string;
}

export function VideoList({ title, videos, seeAllHref }: VideoListProps) {
  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <Link href={seeAllHref} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
          مشاهده همه
        </Link>
      </div>
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} id={video.id} title={video.title} thumbnailUrl={video.thumbnailUrl} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">ویدیویی برای نمایش وجود ندارد.</p>
      )}
    </section>
  );
}