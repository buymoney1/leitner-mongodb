// scripts/send-nightly-notifications.ts
import 'dotenv/config';

async function sendNightlyNotifications() {
  try {
    // زمان‌بندی رندوم بین ۷ تا ۹ شب
    const now = new Date();
    const hour = now.getHours();
    
    // فقط بین ۷ تا ۹ شب اجرا شود
    if (hour < 19 || hour > 21) {
      console.log('⏰ الان وقت نوتیفیکیشن نیست');
      return;
    }

    // 50% شانس اجرا (برای رندوم بودن)
    if (Math.random() > 0.5) {
      console.log('🎲 امروز نوتیفیکیشن نمی‌فرستیم (رندوم)');
      return;
    }

    console.log('🌙 ارسال نوتیفیکیشن‌های شبانه...');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send-nightly`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      }
    );

    const result = await response.json();
    console.log('✅ نتیجه ارسال:', result);
  } catch (error) {
    console.error('❌ خطا در ارسال نوتیفیکیشن:', error);
  }
}

// اجرای تابع
sendNightlyNotifications();