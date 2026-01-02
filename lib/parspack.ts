// lib/parspack.ts
import { S3Client, PutObjectCommand, GetObjectCommand, 
    ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

export interface UploadResult {
storageKey: string;
publicUrl: string | null;
fileSize: number;
mimeType: string;
fileName: string;
}

export interface StorageFile {
Key?: string;
Size?: number;
LastModified?: Date;
ETag?: string;
}

export class ParsPackService {
private client: S3Client;
private bucket: string;
private endpoint: string;

constructor() {
// اعتبارسنجی متغیرهای محیطی
const requiredEnvVars = [
 'PARS_PACK_API_KEY',
 'PARS_PACK_SECRET_KEY', 
 'PARS_PACK_BUCKET_NAME',
 'PARS_PACK_ENDPOINT'
];

for (const envVar of requiredEnvVars) {
 if (!process.env[envVar]) {
   throw new Error(`متغیر محیطی ${envVar} تنظیم نشده است`);
 }
}

this.client = new S3Client({
 endpoint: process.env.PARS_PACK_ENDPOINT!,
 region: process.env.PARS_PACK_REGION || 'default',
 credentials: {
   accessKeyId: process.env.PARS_PACK_API_KEY!,
   secretAccessKey: process.env.PARS_PACK_SECRET_KEY!,
 },
 forcePathStyle: true,
});

this.bucket = process.env.PARS_PACK_BUCKET_NAME!;
this.endpoint = process.env.PARS_PACK_ENDPOINT!.replace(/\/$/, '');
}

// بررسی اتصال به پارس‌پک
async testConnection(): Promise<boolean> {
try {
 await this.listStorageFiles('', 1);
 console.log('✅ اتصال به پارس‌پک موفقیت‌آمیز بود');
 return true;
} catch (error) {
 console.error('❌ خطا در اتصال به پارس‌پک:', error);
 return false;
}
}

// آپلود فایل
async uploadFile(
fileBuffer: Buffer,
originalName: string,
isPublic: boolean = false
): Promise<UploadResult> {
try {
 const fileExt = originalName.split('.').pop()?.toLowerCase() || '';
 const uniqueName = `${uuidv4()}.${fileExt}`;
 
 const mimeType = this.getMimeType(originalName);
 const fileType = this.getFileType(mimeType);
 const storageKey = `${fileType}/${uniqueName}`;

 console.log(`📤 آپلود فایل: ${originalName} به ${storageKey}`);

 const command = new PutObjectCommand({
   Bucket: this.bucket,
   Key: storageKey,
   Body: fileBuffer,
   ContentType: mimeType,
   ACL: isPublic ? 'public-read' : 'private',
   Metadata: {
     originalName,
     uploadedAt: new Date().toISOString(),
     uploadedBy: 'nextjs-app'
   },
 });

 await this.client.send(command);
 console.log(`✅ فایل با موفقیت آپلود شد: ${storageKey}`);

 const publicUrl = isPublic ? `${this.endpoint}/${storageKey}` : null;

 return {
   storageKey,
   publicUrl,
   fileSize: fileBuffer.length,
   mimeType,
   fileName: uniqueName,
 };
} catch (error) {
 console.error('❌ خطا در آپلود فایل:', error);
 throw new Error(`آپلود فایل ناموفق بود: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
}
}

// دریافت لینک فایل
async getFileUrl(
storageKey: string, 
expiresIn: number = 7 * 24 * 3600 // 7 روز پیش‌فرض
): Promise<string> {
try {
 console.log(`🔗 در حال ساخت لینک برای: ${storageKey}`);
 
 const command = new GetObjectCommand({
   Bucket: this.bucket,
   Key: storageKey,
 });

 const signedUrl = await getSignedUrl(this.client, command, {
   expiresIn,
 });

 console.log(`✅ لینک ساخته شد (انقضا: ${expiresIn} ثانیه)`);
 return signedUrl;
} catch (error) {
 console.error('❌ خطا در ساخت لینک:', error);
 throw new Error(`ساخت لینک ناموفق بود: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
}
}

// حذف فایل
async deleteFile(storageKey: string): Promise<void> {
try {
 console.log(`🗑️ در حال حذف فایل: ${storageKey}`);
 
 const command = new DeleteObjectCommand({
   Bucket: this.bucket,
   Key: storageKey,
 });

 await this.client.send(command);
 console.log(`✅ فایل حذف شد: ${storageKey}`);
} catch (error) {
 console.error('❌ خطا در حذف فایل:', error);
 throw new Error(`حذف فایل ناموفق بود: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
}
}

// لیست فایل‌ها
async listStorageFiles(prefix: string = '', maxKeys: number = 1000): Promise<StorageFile[]> {
try {
 console.log(`📂 در حال دریافت لیست فایل‌ها (پیشوند: ${prefix || 'بدون'})`);
 
 const command = new ListObjectsV2Command({
   Bucket: this.bucket,
   Prefix: prefix,
   MaxKeys: maxKeys,
 });

 const response = await this.client.send(command);
 const files = response.Contents || [];
 
 console.log(`✅ ${files.length} فایل دریافت شد`);
 return files;
} catch (error) {
 console.error('❌ خطا در دریافت لیست فایل‌ها:', error);
 throw new Error(`دریافت لیست فایل‌ها ناموفق بود: ${error instanceof Error ? error.message : 'خطای ناشناخته'}`);
}
}

// دریافت اطلاعات فایل
async getFileMetadata(storageKey: string) {
try {
 console.log(`📄 در حال دریافت اطلاعات فایل: ${storageKey}`);
 
 const command = new HeadObjectCommand({
   Bucket: this.bucket,
   Key: storageKey,
 });

 const response = await this.client.send(command);
 
 return {
   size: response.ContentLength || 0,
   mimeType: response.ContentType || 'application/octet-stream',
   lastModified: response.LastModified,
   metadata: response.Metadata || {},
 };
} catch (error) {
 console.error('❌ خطا در دریافت اطلاعات فایل:', error);
 return null;
}
}

// بررسی وجود فایل
async fileExists(storageKey: string): Promise<boolean> {
try {
 await this.getFileMetadata(storageKey);
 return true;
} catch (error: any) {
 if (error.name === 'NotFound') {
   return false;
 }
 throw error;
}
}

// تشخیص MIME Type
private getMimeType(filename: string): string {
const ext = filename.split('.').pop()?.toLowerCase() || '';

const mimeTypes: Record<string, string> = {
 // تصاویر
 'jpg': 'image/jpeg',
 'jpeg': 'image/jpeg',
 'png': 'image/png',
 'gif': 'image/gif',
 'webp': 'image/webp',
 'svg': 'image/svg+xml',
 'bmp': 'image/bmp',
 'ico': 'image/x-icon',
 
 // ویدیوها
 'mp4': 'video/mp4',
 'webm': 'video/webm',
 'ogg': 'video/ogg',
 'mov': 'video/quicktime',
 'avi': 'video/x-msvideo',
 'mkv': 'video/x-matroska',
 'wmv': 'video/x-ms-wmv',
 'flv': 'video/x-flv',
 '3gp': 'video/3gpp',
 
 // صداها
 'mp3': 'audio/mpeg',
 'wav': 'audio/wav',
 'm4a': 'audio/mp4',
 'aac': 'audio/aac',
 'flac': 'audio/flac',
 'wma': 'audio/x-ms-wma',
 
 // اسناد
 'pdf': 'application/pdf',
 'doc': 'application/msword',
 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 'xls': 'application/vnd.ms-excel',
 'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 'ppt': 'application/vnd.ms-powerpoint',
 'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 'txt': 'text/plain',
 'csv': 'text/csv',
 'json': 'application/json',
 'xml': 'application/xml',
 'zip': 'application/zip',
 'rar': 'application/x-rar-compressed',
};

return mimeTypes[ext] || 'application/octet-stream';
}

// تشخیص نوع فایل
private getFileType(mimeType: string): string {
if (mimeType.startsWith('image/')) return 'images';
if (mimeType.startsWith('video/')) return 'videos';
if (mimeType.startsWith('audio/')) return 'audios';
if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
 return 'documents';
}
return 'others';
}

// دریافت حجم قابل خواندن
getReadableFileSize(bytes: number): string {
if (bytes === 0) return '0 B';

const k = 1024;
const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
const i = Math.floor(Math.log(bytes) / Math.log(k));

return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// استخراج نام فایل از storageKey
extractFileName(storageKey: string): string {
return storageKey.split('/').pop() || storageKey;
}

// تشخیص نوع فایل از storageKey
getFileTypeFromKey(storageKey: string): string {
const parts = storageKey.split('/');
if (parts.length > 1) {
 const folder = parts[0];
 if (['images', 'videos', 'audios', 'documents', 'others'].includes(folder)) {
   return folder;
 }
}

const extension = storageKey.split('.').pop()?.toLowerCase() || '';
const mimeType = this.getMimeType(storageKey);
return this.getFileType(mimeType);
}
}

// ایجاد instance جهانی
export const parspackService = new ParsPackService();

// تست اتصال هنگام راه‌اندازی
if (typeof window === 'undefined') {
console.log('🔌 در حال تست اتصال به پارس‌پک...');
parspackService.testConnection().then(success => {
if (success) {
 console.log('🚀 پارس‌پک آماده استفاده است');
}
}).catch(error => {
console.error('⚠️ هشدار: پارس‌پک در دسترس نیست:', error.message);
});
}