// // src/app/api/notifications/send-daily-reminder/route.ts
// import { NextResponse } from 'next/server';
// import { Resend } from 'resend';
// import { prisma } from '@/lib/prisma';

// const resend = new Resend(process.env.RESEND_API_KEY);

// // تابعی برای تبدیل زمان انتخابی به ساعت عددی
// const getHourFromPreference = (preference: string): number => {
//   switch (preference) {
//     case 'MORNING': return 9;    // 9 صبح
//     case 'AFTERNOON': return 15;  // 3 بعد از ظهر
//     case 'EVENING': return 18;    // 6 عصر
//     case 'NIGHT': return 21;      // 9 شب
//     default: return 18;           // پیش‌فرض عصر
//   }
// };

// export async function POST(request: Request) {
//   // 1. امنیت: بررسی اینکه درخواست از طرف کرون جاب ماست
//   const authHeader = request.headers.get('authorization');
//   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const now = new Date();
    
//     // 2. پیدا کردن تمام کاربرانی که امروز ایمیل دریافت نکرده‌اند
//     const users = await prisma.user.findMany({
//       where: {
//         suggestedReviewTime: { not: null },
//         lastDailyEmailNotificationAt: {
//           lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()), // قبل از امروز
//         },
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         timezone: true,
//         suggestedReviewTime: true,
//       },
//     });

//     for (const user of users) {
//       if (!user.email || !user.suggestedReviewTime) continue;

//       // 3. بررسی زمان در تایم‌زون کاربر
//       const targetHour = getHourFromPreference(user.suggestedReviewTime);
//       const userCurrentTime = new Date(now.toLocaleString("en-US", { timeZone: user.timezone }));
//       const userCurrentHour = userCurrentTime.getHours();

//       if (userCurrentHour === targetHour) {
//         // 4. شمارش کارت‌های مرور
//         const dueCardsCount = await prisma.card.count({
//           where: {
//             userId: user.id,
//             nextReviewAt: { lte: now },
//           },
//         });

//         if (dueCardsCount > 0) {
//           // 5. ارسال ایمیل
//           try {
//             await resend.emails.send({
//               from: process.env.EMAIL_FROM!,
//               to: [user.email],
//               subject: `وقت مرور کلماتتونه! (${dueCardsCount} کارت منتظره)`,
//               html: `
//                 <div style="font-family: sans-serif; direction: rtl; text-align: right; padding: 20px; background-color: #f9f9f9;">
//                   <h2 style="color: #333;">سلام ${user.name || 'دوست عزیز'}،</h2>
//                   <p style="color: #555; font-size: 16px;">
//                     وقتشه که ${dueCardsCount} کارت رو برای امروز مرور کنی و یک قدم دیگه به هدفت نزدیک شی!
//                   </p>
//                   <a href="${process.env.NEXTAUTH_URL}/dashboard/review" 
//                      style="display: inline-block; padding: 12px 25px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
//                     شروع مرور
//                   </a>
//                   <p style="color: #999; font-size: 12px; margin-top: 30px;">
//                     این ایمیل به درخواست شما در زمان ${user.suggestedReviewTime} ارسال شده است.
//                   </p>
//                 </div>
//               `,
//             });

//             console.log(`Email sent to ${user.email}`);

//             // 6. آپدیت زمان آخر ایمیل ارسال شده
//             await prisma.user.update({
//               where: { id: user.id },
//               data: { lastDailyEmailNotificationAt: now },
//             });

//           } catch (emailError) {
//             console.error(`Failed to send email to ${user.email}:`, emailError);
//           }
//         }
//       }
//     }

//     return NextResponse.json({ success: true, message: 'Cron job executed successfully.' });

//   } catch (error) {
//     console.error("Cron job failed:", error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }