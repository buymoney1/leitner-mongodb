// components/video/EpisodeList.tsx
'use client';

import { useState } from 'react';
import { Play, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  description: string | null;
  duration: number;
  thumbnailUrl: string | null;
}

interface Season {
  id: string;
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

interface EpisodeListProps {
  season: Season;
  seriesId: string;
}

export default function EpisodeList({ season, seriesId }: EpisodeListProps) {
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} دقیقه`;
  };

  const toggleWatched = (episodeId: string) => {
    if (watchedEpisodes.includes(episodeId)) {
      setWatchedEpisodes(watchedEpisodes.filter(id => id !== episodeId));
    } else {
      setWatchedEpisodes([...watchedEpisodes, episodeId]);
    }
  };

  return (
    <div className="divide-y divide-gray-300 dark:divide-gray-700">
      {season.episodes.map((episode) => (
        <div key={episode.id} className="group hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
          <div className="p-4 flex items-start gap-4">
            {/* شماره قسمت */}
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
              <span className="font-bold text-gray-800 dark:text-gray-200">{episode.episodeNumber}</span>
            </div>
            
            {/* اطلاعات قسمت */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg truncate text-gray-900 dark:text-white">
                      {episode.title}
                    </h3>

                  </div>
                  
                  {episode.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                      {episode.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(episode.duration)}
                    </div>
                  </div>
                </div>
                
                {/* دکمه پخش */}
                <div className="flex-shrink-0">
                  <Link
                    href={`/watch/${seriesId}/${season.seasonNumber}/${episode.episodeNumber}`}
                    className="px-4 py-2 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    پخش
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}