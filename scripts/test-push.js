// scripts/send-test-notification.js
require('dotenv').config({ path: '.env.local' });
const webpush = require('web-push');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');

const DATA_DIR = join(process.cwd(), 'data');
const FILE_PATH = join(DATA_DIR, 'subscriptions.json');

// تنظیم VAPID
webpush.setVapidDetails(
  'mailto:buymoney.10@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendTestNotification() {
  console.log('🚀 ارسال نوتیفیکیشن تستی...\n');
  
  // 1. خواندن subscriptions
  if (!existsSync(FILE_PATH)) {
    console.error('❌ فایل subscriptions یافت نشد');
    return;
  }
  
  const data = JSON.parse(readFileSync(FILE_PATH, 'utf8'));
  
  if (data.subscriptions.length === 0) {
    console.log('⚠️ هیچ subscription یافت نشد');
    return;
  }
  
  console.log(`✅ ${data.subscriptions.length} subscription یافت شد\n`);
  
  // 2. ارسال به اولین subscription
  const subscription = data.subscriptions[0];
  console.log('📤 ارسال به:');
  console.log('   کاربر:', subscription.userId);
  console.log('   Endpoint:', subscription.endpoint.substring(0, 80) + '...');
  
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  };
  
  try {
    console.log('\n📨 در حال ارسال پیام...');
    
    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        title: '🌙 شب بخیر!',
        body: 'الان زمان مناسبیه برای مرور لغات',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        dir: 'rtl',
        lang: 'fa-IR',
        tag: 'night-reminder',
        timestamp: new Date().toISOString(),
        url: '/review',
        actions: [
          {
            action: 'review',
            title: 'شروع مرور',
          },
          {
            action: 'later',
            title: 'بعداً',
          },
        ],
      })
    );
    
    console.log('✅ پیام ارسال شد!');
    console.log('\n📱 نوتیفیکیشن باید در مرورگر نمایش داده شود.');
    console.log('💡 نکات:');
    console.log('   - مرورگر باید باز باشد');
    console.log('   - صفحه را minimize نکنید');
    console.log('   - ممکن است چند ثانیه طول بکشد');
    
  } catch (error) {
    console.error('❌ خطا در ارسال:', error.message);
    console.log('\n🔧 عیب‌یابی:');
    console.log('   1. بررسی کنید VAPID keys درست باشند');
    console.log('   2. مرورگر باید HTTPS باشد (در localhost مشکل دارد)');
    console.log('   3. ممکن است subscription منقضی شده باشد');
  }
}

sendTestNotification().catch(console.error);