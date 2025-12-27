// components/video/VideoPlayerClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { parseVTT } from '@/utils';
import { Vocabulary } from '../../../types';
import VideoPlayer from './VideoPlayer';

interface VideoData {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  level: string;
  subtitlesVtt: string | null;
  vocabularies: Vocabulary[];
}

interface VideoPlayerClientProps {
  initialVideoData: VideoData;
}

export default function VideoPlayerClient({ initialVideoData }: VideoPlayerClientProps) {
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>(initialVideoData.vocabularies);

  useEffect(() => {
    // پردازش زیرنویس‌ها
    if (initialVideoData.subtitlesVtt) {
      try {
        const parsedSubtitles = parseVTT(initialVideoData.subtitlesVtt);
        setSubtitles(parsedSubtitles);
      } catch (error) {
        console.error('Error parsing subtitles:', error);
      }
    }
  }, [initialVideoData.subtitlesVtt]);

  // تابع برای حذف لغت
  const handleRemoveWord = async (id: string) => {
    try {
      // حذف از API
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('خطا در حذف کارت');
      }

      // حذف از لیست محلی
      setVocabularies(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error removing word:', error);
      // حتی اگر API خطا داد، از لیست محلی حذف کن
      setVocabularies(prev => prev.filter(v => v.id !== id));
    }
  };

  // آماده کردن props برای VideoPlayer
  const videoPlayerProps = {
    videoData: initialVideoData,
    subtitles,
    vocabularies,
    onRemoveWord: handleRemoveWord
  };

  return <VideoPlayer {...videoPlayerProps} />;
}