
// scripts/test-prisma-after-fix.ts
import { PrismaClient } from '@prisma/client';

async function test() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 تست Prisma بعد از اصلاح...');
    
    // 1. تست User
    console.log('\n1. تست خواندن User:');
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`✅ ${users.length} کاربر خوانده شد`);
    users.forEach(user => {
      console.log(`   ${user.name}: ${user.createdAt} (${typeof user.createdAt})`);
    });
    
    // 2. تست ActivityTracking
    console.log('\n2. تست خواندن ActivityTracking:');
    const activities = await prisma.activityTracking.findMany({
      take: 3,
      select: {
        id: true,
        activityType: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`✅ ${activities.length} فعالیت خوانده شد`);
    
    // 3. تست ایجاد رکورد جدید
    console.log('\n3. تست ایجاد رکورد جدید:');
    try {
      const testUser = await prisma.user.findFirst();
      if (testUser) {
        const newActivity = await prisma.activityTracking.create({
          data: {
            userId: testUser.id,
            activityType: 'test',
            duration: 1,
            pathname: '/test'
          }
        });
        console.log(`✅ رکورد جدید ایجاد شد: ${newActivity.id}`);
        
        // حذف رکورد تست
        await prisma.activityTracking.delete({
          where: { id: newActivity.id }
        });
        console.log('✅ رکورد تست حذف شد');
      }
    } catch (error) {
      console.log('❌ خطا در ایجاد رکورد:', error.message);
    }
    
    console.log('\n🎉 همه تست‌ها موفقیت‌آمیز بودند!');
    
  } catch (error) {
    console.error('❌ خطا در تست:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
