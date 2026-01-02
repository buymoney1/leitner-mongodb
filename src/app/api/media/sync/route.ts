// app/api/media/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { parspackService } from '../../../../../lib/parspack';
import { getAuthSession } from '../../../../../lib/server-auth';


export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    // گرفتن تمام فایل‌ها از پارس‌پک
    const storageFiles = await parspackService.listStorageFiles();
    
    // گرفتن فایل‌هایی که در دیتابیس ثبت شده‌اند
    const existingFiles = await prisma.mediaFile.findMany({
      where: {
        uploaderId: session.user.id
      },
      select: {
        storageKey: true
      }
    });

    const existingKeys = new Set(existingFiles.map(f => f.storageKey));
    const newFiles = [];
    const skippedFiles = [];

    // بررسی هر فایل
    for (const file of storageFiles) {
      if (!file.Key) continue;

      // اگر فایل در دیتابیس نیست، اضافه کن
      if (!existingKeys.has(file.Key)) {
        try {
          // استخراج اطلاعات از نام فایل
          const fileName = file.Key.split('/').pop() || 'unknown';
          const fileType = this.getFileTypeFromKey(file.Key);
          const mimeType = this.getMimeTypeFromFileName(fileName);
          
          // ساخت رکورد در دیتابیس
          const mediaFile = await prisma.mediaFile.create({
            data: {
              fileName: fileName,
              originalName: fileName,
              fileType: fileType,
              mimeType: mimeType,
              fileSize: file.Size || 0,
              fileSizeMB: file.Size ? parseFloat((file.Size / (1024 * 1024)).toFixed(2)) : 0,
              storageKey: file.Key,
              publicUrl: null, // پیش‌فرض private
              isPublic: false,
              accessLevel: 'private',
              uploaderId: session.user.id,
              tags: [],
              category: null,
              views: 0,
              downloads: 0,
            },
          });

          newFiles.push(mediaFile);
        } catch (error) {
          console.error(`Error syncing file ${file.Key}:`, error);
          skippedFiles.push(file.Key);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        newFiles,
        skippedFiles,
        totalFiles: storageFiles.length,
        message: `همگام‌سازی کامل شد. ${newFiles.length} فایل جدید اضافه شد.`
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { 
        error: 'خطا در همگام‌سازی فایل‌ها',
        details: error instanceof Error ? error.message : 'خطای ناشناخته'
      },
      { status: 500 }
    );
  }
}

// تابع کمکی برای تشخیص نوع فایل از Key
function getFileTypeFromKey(key: string): string {
  const parts = key.split('/');
  if (parts.length > 1) {
    return parts[0]; // images, videos, audios, documents
  }
  
  const extension = key.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension)) return 'video';
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension)) return 'audio';
  return 'document';
}

// تابع کمکی برای تشخیص MIME Type
function getMimeTypeFromFileName(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'm4a': 'audio/mp4',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}