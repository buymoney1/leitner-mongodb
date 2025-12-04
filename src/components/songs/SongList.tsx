// app/songs/components/SongList.tsx
import { Play, Edit, Trash2, Music } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverUrl?: string;
}

interface SongListProps {
  songs: Song[];
  isAdmin: boolean;
  onPlay: (song: Song) => void;
  onEdit: (song: Song) => void;
  onDelete: (id: string) => void;
  formatDuration: (seconds: number) => string;
}

export default function SongList({ 
  songs, 
  isAdmin, 
  onPlay, 
  onEdit, 
  onDelete, 
  formatDuration 
}: SongListProps) {
  return (
    <div className="bg-white dark:bg-gray-800/30 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-300 dark:border-gray-700/50 overflow-hidden transition-colors duration-300">
      {/* Table Header - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 border-b border-gray-300 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
        <div className="col-span-1">#</div>
        <div className="col-span-5">عنوان</div>
        <div className="col-span-3">خواننده</div>
        <div className="col-span-2">آلبوم</div>
        <div className="col-span-1 text-left">
          مدت
        </div>
      </div>

      {/* Songs List */}
      <div className="divide-y divide-gray-300 dark:divide-gray-700/30">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="group hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer"
            onClick={() => onPlay(song)}
          >
            {/* Desktop View */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4">
              {/* Number */}
              <div className="col-span-1 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {index + 1}
              </div>

              {/* Song Info */}
              <div className="col-span-5 flex items-center gap-4">
                <div className="relative">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10 flex items-center justify-center">
                      <Music className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {song.title}
                  </h3>
                </div>
              </div>

              {/* Artist */}
              <div className="col-span-3 flex items-center text-gray-700 dark:text-gray-300">
                {song.artist}
              </div>

              {/* Album */}
              <div className="col-span-2 flex items-center text-gray-500 dark:text-gray-400">
                {song.album || '-'}
              </div>

              {/* Duration & Actions */}
              <div className="col-span-1 flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  {formatDuration(song.duration)}
                </span>
                
                {isAdmin && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(song);
                      }}
                      className="p-1.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(song.id);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden p-4">
              <div className="flex items-center gap-3">
                {/* Cover Image */}
                <div className="relative flex-shrink-0">
                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10 flex items-center justify-center">
                      <Music className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                      {song.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                    {song.artist}
                  </p>
                  
                  {song.album && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                      {song.album}
                    </p>
                  )}
                </div>

                {/* Admin Actions - Mobile */}
                {isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(song);
                      }}
                      className="p-1.5 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(song.id);
                      }}
                      className="p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}