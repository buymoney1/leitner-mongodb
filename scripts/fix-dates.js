// scripts/test-connection.js
const { MongoClient } = require('mongodb');

async function testConnection() {
  console.log('🔗 تست اتصال به MongoDB Atlas...\n');
  
  // چندین فرمت برای تست
  const connectionStrings = [
    // 1. با encode دوگانه
    "mongodb+srv://buymoney:buymoney13788731maB%2540@cluster0.w1gwvui.mongodb.net/leitner?appName=Cluster0&retryWrites=true&w=majority",
    
    // 2. با دو @
    "mongodb+srv://buymoney:buymoney13788731maB@@cluster0.w1gwvui.mongodb.net/leitner?appName=Cluster0&retryWrites=true&w=majority",
    
    // 3. بدون appName
    "mongodb+srv://buymoney:buymoney13788731maB%40@cluster0.w1gwvui.mongodb.net/leitner?retryWrites=true&w=majority"
  ];
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const uri = connectionStrings[i];
    console.log(`\n${i + 1}. تست با URI:\n${uri}\n`);
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    
    try {
      await client.connect();
      console.log('✅ اتصال موفقیت‌آمیز بود!');
      
      // تست یک کوئری ساده
      const db = client.db();
      const collections = await db.listCollections().toArray();
      console.log(`📊 تعداد کالکشن‌ها: ${collections.length}`);
      
      await client.close();
      console.log('✅ همه چیز درست کار می‌کند!');
      
      // اگر این یکی کار کرد، استفاده کن
      console.log(`\n🎉 استفاده از connection string شماره ${i + 1}`);
      return uri;
      
    } catch (error) {
      console.log(`❌ خطا: ${error.message}`);
      if (error.message.includes('authentication')) {
        console.log('⚠️  مشکل احراز هویت - احتمالاً رمز عبور اشتباه است');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('⚠️  مشکل DNS - اینترنت را چک کنید یا از VPN استفاده نکنید');
      } else if (error.message.includes('timed out')) {
        console.log('⚠️  timeout - فایروال یا اینترنت مشکل دارد');
      }
    }
  }
  
  console.log('\n❌ هیچکدام از connection stringها کار نکرد');
  return null;
}

// همچنین تست با Prisma
async function testPrismaConnection() {
  console.log('\n🔧 تست اتصال Prisma...\n');
  
  // تنظیم محیطی موقت
  process.env.DATABASE_URL = "mongodb+srv://buymoney:buymoney13788731maB%2540@cluster0.w1gwvui.mongodb.net/leitner?retryWrites=true&w=majority";
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['info', 'warn', 'error']
    });
    
    // یک کوئری ساده
    const userCount = await prisma.user.count();
    console.log(`✅ Prisma متصل شد! تعداد کاربران: ${userCount}`);
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    console.log(`❌ خطای Prisma: ${error.message}`);
    return false;
  }
}

// اجرا
(async () => {
  console.log('='.repeat(60));
  console.log('🔍 تست جامع اتصال به MongoDB Atlas');
  console.log('='.repeat(60));
  
  const workingUri = await testConnection();
  
  if (workingUri) {
    console.log(`\n✨ Connection String کارآمد:\n${workingUri}\n`);
    
    // تست Prisma
    await testPrismaConnection();
    
    console.log('\n📋 مراحل بعدی:');
    console.log('1. این connection string را در .env.local کپی کنید');
    console.log('2. از Prisma generate استفاده کنید:');
    console.log('   npx prisma generate --force');
    console.log('3. سرور را ری‌استارت کنید');
  }
})();