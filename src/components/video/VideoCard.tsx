// components/VideoCard.tsx
import Link from 'next/link';
import Image from 'next/image';

interface VideoCardProps {
  id: string;
  title: string;
  thumbnailUrl: string | null;
}

export function VideoCard({ id, title, thumbnailUrl }: VideoCardProps) {
  return (
    <Link href={`/video/${id}`}>
      <div className="flex flex-col rounded-lg border border-gray-700 bg-gray-800 overflow-hidden shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 cursor-pointer">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title} width={400} height={225} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-700 flex items-center justify-center text-gray-500">
            No Thumbnail
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
        </div>
      </div>
    </Link>
  );
}