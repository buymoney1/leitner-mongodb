// app/video-levels/page.tsx
import Link from 'next/link';

const videoLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function VideoLevelsPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">English Learning Levels</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {videoLevels.map((level) => (
          <Link
            key={level}
            href={`/videos-by-level/${level}`} // <-- لینک به مسیر جدید
            className="block p-6 bg-blue-500 text-white rounded-lg text-center font-semibold text-xl hover:bg-blue-600 transition-colors"
          >
            {level}
          </Link>
        ))}
      </div>
    </main>
  );
}