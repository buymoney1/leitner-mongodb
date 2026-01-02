// lib/media-helper.ts
import { PrismaClient } from '@prisma/client';

// یک instance جدید از PrismaClient بسازید
const prisma = new PrismaClient();

import { parspackService } from './parspack';

export class MediaHelper {
  // گرفتن لینک فایل
  static async getFileUrl(fileId: string): Promise<string | null> {
    try {
      const mediaFile = await prisma.mediaFile.findUnique({
        where: { id: fileId },
      });

      if (!mediaFile) {
        return null;
      }

      // اگر فایل عمومی است
      if (mediaFile.isPublic && mediaFile.publicUrl) {
        return mediaFile.publicUrl;
      }

      // اگر لینک موقت معتبر داریم
      if (mediaFile.signedUrl && mediaFile.urlExpiresAt) {
        const expiresAt = new Date(mediaFile.urlExpiresAt);
        const now = new Date();
        
        if (expiresAt > now) {
          return mediaFile.signedUrl;
        }
      }

      // لینک جدید بساز
      const newUrl = await parspackService.getFileUrl(mediaFile.storageKey);
      
      // ذخیره در دیتابیس
      await prisma.mediaFile.update({
        where: { id: fileId },
        data: {
          signedUrl: newUrl,
          urlExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }
      });

      return newUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  // استفاده در ویدیوها
  static async getVideoUrl(videoId: string): Promise<string | null> {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { videoUrl: true }
    });

    return video?.videoUrl || null;
  }

  // استفاده در پادکست‌ها
  static async getPodcastUrl(podcastId: string): Promise<string | null> {
    const podcast = await prisma.podcast.findUnique({
      where: { id: podcastId },
      select: { audioUrl: true }
    });

    return podcast?.audioUrl || null;
  }

  // استفاده در آهنگ‌ها
  static async getSongUrl(songId: string): Promise<string | null> {
    const song = await prisma.song.findUnique({
      where: { id: songId },
      select: { audioUrl: true }
    });

    return song?.audioUrl || null;
  }
}