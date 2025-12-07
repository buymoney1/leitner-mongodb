// app/songs/SongsClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Music, Plus, Edit, Trash2, Filter, Search, Clock, User, Disc, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SongModal from '@/components/songs/SongModal';
import PlayerBar from '@/components/songs/PlayerBar';
import SongList from '@/components/songs/SongList';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string;
  lyrics: string;
  isPublished: boolean;
  createdById?: string;
  createdAt: string;
}

interface SongFormData {
  title: string;
  artist: string;
  album: string;
  duration: string;
  audioUrl: string;
  coverUrl: string;
  lyrics: string;
  isPublished: boolean;
}

export default function SongsClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userWithRole = session?.user as any;
  const isAdmin = userWithRole?.role === 'admin';
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, [selectedArtist]);

  const fetchSongs = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedArtist) params.append('artist', selectedArtist);
      
      const response = await fetch(`/api/songs?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setSongs(data.songs || []);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSong = async (formData: SongFormData) => {
    setSaving(true);
    try {
      const url = editingSong 
        ? `/api/songs/${editingSong.id}`
        : '/api/songs';
      
      const method = editingSong ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowAddModal(false);
        setEditingSong(null);
        fetchSongs();
      } else {
        alert(result.error || 'خطایی در ذخیره آهنگ رخ داد.');
      }
    } catch (error) {
      console.error('Error saving song:', error);
      alert('خطا در ارتباط با سرور.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!confirm('آیا از حذف این آهنگ مطمئن هستید؟')) return;

    try {
      const response = await fetch(`/api/songs/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        fetchSongs();
      } else {
        alert(result.error || 'خطایی در حذف آهنگ رخ داد.');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('خطا در ارتباط با سرور.');
    }
  };

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    router.push(`/songs/${song.id}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uniqueArtists = Array.from(new Set(songs.map(song => song.artist)));

  const filteredSongs = songs.filter(song => {
    if (searchTerm) {
      return (
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.album && song.album.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 md:w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              آهنگ‌های انگلیسی
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              گوش کنید و زبان یاد بگیرید
            </p>
          </div>

          {/* Controls - Mobile Responsive */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
            
            {/* Search */}
            <div className="flex-1 relative order-2 md:order-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4 md:h-5 md:w-5" />
              <input
                type="text"
                placeholder="جستجوی آهنگ، خواننده یا آلبوم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8 w-full pl-9 md:pl-10 pr-3 md:pr-12 py-2 md:py-3 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg md:rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
              />
            </div>

            {/* Artist Filter */}
            <div className="flex items-center gap-2 order-1 md:order-2">
              <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-400 dark:text-gray-500" />
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg md:rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
              >
                <option value="">همه خواننده‌ها</option>
                {uniqueArtists.map(artist => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Song Button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg md:rounded-xl transition-all duration-300 hover:scale-105 shadow-lg shadow-green-500/25 order-3"
              >
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-base">افزودن آهنگ جدید</span>
              </button>
            )}
          </div>

          {/* Songs List */}
          <SongList
            songs={filteredSongs}
            isAdmin={isAdmin}
            onPlay={handlePlaySong}
            onEdit={setEditingSong}
            onDelete={handleDeleteSong}
            formatDuration={formatDuration}
          />

          {/* Empty State */}
          {songs.length === 0 && (
            <div className="text-center py-8 md:py-12">
              <Music className="h-12 w-12 md:h-16 md:w-16 text-gray-400 dark:text-gray-600 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-2">
                آهنگی یافت نشد
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm md:text-base">
                هنوز هیچ آهنگی اضافه نشده است.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Player Bar */}
      {currentSong && (
        <PlayerBar
          song={currentSong}
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          onClose={() => setCurrentSong(null)}
          formatDuration={formatDuration}
        />
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingSong) && (
        <SongModal
          song={editingSong}
          onClose={() => {
            setShowAddModal(false);
            setEditingSong(null);
          }}
          onSave={handleSaveSong}
          loading={saving}
        />
      )}
    </>
  );
}