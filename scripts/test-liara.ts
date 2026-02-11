// scripts/test-liara.ts
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
dotenv.config();

async function testLiara() {
  const client = new S3Client({
    endpoint: process.env.LIARA_ENDPOINT,
    region: "default",
    credentials: {
      accessKeyId: process.env.LIARA_ACCESS_KEY!,
      secretAccessKey: process.env.LIARA_SECRET_KEY!,
    },
    forcePathStyle: true,
  });

  try {
    // تست لیست باکت‌ها
    console.log('🔍 در حال بررسی باکت‌ها...');
    const listBuckets = new ListBucketsCommand({});
    const buckets = await client.send(listBuckets);
    console.log('✅ باکت‌های موجود:', buckets.Buckets?.map(b => b.Name));
    
    // بررسی باکت خاص
    const targetBucket = process.env.LIARA_BUCKET_NAME;
    const bucketExists = buckets.Buckets?.some(b => b.Name === targetBucket);
    
    if (bucketExists) {
      console.log(`✅ باکت "${targetBucket}" وجود دارد`);
    } else {
      console.error(`❌ باکت "${targetBucket}" وجود ندارد!`);
      console.log('باکت‌های موجود:', buckets.Buckets?.map(b => b.Name));
    }
    
  } catch (error) {
    console.error('❌ خطا:', error);
  }
}

testLiara();