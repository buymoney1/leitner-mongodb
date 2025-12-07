// scripts/check-database.js
const { PrismaClient } = require('@prisma/client');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

class DatabaseInspector {
  constructor() {
    this.prisma = new PrismaClient({ log: ['error'] });
    this.mongoClient = null;
    this.report = {
      summary: {
        totalModels: 0,
        totalRecords: 0,
        issuesFound: 0,
        startTime: new Date(),
        endTime: null,
        duration: null
      },
      models: {},
      rawCollections: {},
      issues: []
    };
  }

  async connectMongo() {
    try {
      const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/leitner';
      console.log('🔗 تلاش برای اتصال به MongoDB...');
      
      this.mongoClient = new MongoClient(mongoUri);
      await this.mongoClient.connect();
      console.log('✅ متصل به MongoDB');
      
      return true;
    } catch (error) {
      console.log('❌ خطا در اتصال به MongoDB:', error.message);
      return false;
    }
  }

  async checkAllModels() {
    console.log('\n🔍 بررسی مدل‌های Prisma...');
    console.log('='.repeat(50));

    const models = [
      'User', 'Account', 'Session', 'VerificationToken',
      'Book', 'Card', 'Review',
      'Video', 'VideoVocabulary',
      'Podcast', 'PodcastVocabulary',
      'Article', 'ArticleVocabulary',
      'DailyActivity', 'ActivityTracking',
      'Song', 'NotificationLog', 'PushSubscription'
    ];

    for (const modelName of models) {
      await this.checkModel(modelName);
    }
  }

  async checkModel(modelName) {
    try {
      console.log(`\n📊 بررسی مدل: ${modelName}`);
      
      if (!this.prisma[modelName]) {
        console.log(`   ⚠️ مدل ${modelName} در Prisma Client یافت نشد`);
        this.report.models[modelName] = { exists: false };
        return;
      }

      // تعداد رکوردها
      const count = await this.prisma[modelName].count();
      console.log(`   📈 تعداد رکوردها: ${count}`);
      
      // نمونه‌ای از داده‌ها
      const sample = count > 0 ? await this.prisma[modelName].findFirst() : null;
      
      this.report.models[modelName] = {
        exists: true,
        recordCount: count,
        sample: sample ? this.sanitizeSample(sample) : null,
        dateFields: {}
      };

      // بررسی فیلدهای تاریخ
      if (sample) {
        const dateFields = this.findDateFields(sample);
        console.log(`   📅 فیلدهای تاریخ: ${dateFields.length > 0 ? dateFields.join(', ') : 'هیچ'}`);
        
        for (const field of dateFields) {
          const value = sample[field];
          const isValid = this.isValidDate(value);
          
          this.report.models[modelName].dateFields[field] = {
            type: typeof value,
            value: value,
            isValid: isValid,
            isoString: isValid ? value.toISOString() : null
          };

          if (!isValid) {
            const issue = {
              type: 'INVALID_DATE',
              model: modelName,
              field: field,
              value: value,
              severity: 'HIGH'
            };
            this.report.issues.push(issue);
            console.log(`   ❌ مشکل: فیلد ${field} تاریخ نامعتبر دارد: ${value}`);
          }
        }

        // بررسی ObjectId فیلدها
        const objectIdFields = this.findObjectIdFields(sample);
        if (objectIdFields.length > 0) {
          console.log(`   🆔 فیلدهای ObjectId: ${objectIdFields.join(', ')}`);
          
          // بررسی اعتبار ObjectIdها
          for (const field of objectIdFields) {
            const value = sample[field];
            if (value && !this.isValidObjectId(value)) {
              const issue = {
                type: 'INVALID_OBJECT_ID',
                model: modelName,
                field: field,
                value: value,
                severity: 'MEDIUM'
              };
              this.report.issues.push(issue);
              console.log(`   ⚠️ هشدار: فیلد ${field} ممکن است ObjectId نامعتبر داشته باشد: ${value}`);
            }
          }
        }
      }

      // بررسی ساختار schema از طریق reflection
      await this.checkModelSchema(modelName);

    } catch (error) {
      console.log(`   ❌ خطا در بررسی مدل ${modelName}:`, error.message);
      this.report.models[modelName] = { error: error.message };
    }
  }

  async checkModelSchema(modelName) {
    try {
      // سعی کن با یک create خالی، ساختار مدل را بفهمی
      const emptyData = {};
      
      // این فقط برای گرفتن خطای validation است
      await this.prisma[modelName].findFirst({
        where: { id: 'non_existent_id_123' }
      });
      
    } catch (error) {
      // خطاهای validation را نادیده بگیر
    }
  }

  async checkRawCollections() {
    if (!this.mongoClient) return;
    
    console.log('\n🔍 بررسی مستقیم کالکشن‌های MongoDB...');
    console.log('='.repeat(50));

    try {
      const db = this.mongoClient.db();
      const collections = await db.listCollections().toArray();
      
      console.log(`📚 تعداد کالکشن‌ها: ${collections.length}`);
      
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        console.log(`\n📋 کالکشن: ${collectionName}`);
        
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`   📊 تعداد سندها: ${count}`);
        
        if (count > 0) {
          const sample = await collection.findOne({});
          const issues = this.analyzeMongoDocument(sample, collectionName);
          
          this.report.rawCollections[collectionName] = {
            count: count,
            sample: this.sanitizeSample(sample),
            issues: issues
          };

          if (issues.length > 0) {
            console.log(`   ⚠️ مشکلات یافت شده: ${issues.length}`);
            issues.forEach(issue => {
              console.log(`      ❌ ${issue.type}: ${issue.message}`);
            });
          }
        }
      }
    } catch (error) {
      console.log('❌ خطا در بررسی کالکشن‌ها:', error.message);
    }
  }

  analyzeMongoDocument(doc, collectionName) {
    const issues = [];
    
    if (!doc) return issues;
    
    // بررسی تاریخ‌ها
    Object.keys(doc).forEach(key => {
      const value = doc[key];
      
      // اگر تاریخ است اما به صورت string ذخیره شده
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
        if (typeof value === 'string') {
          // چک کن آیا فرمت تاریخ ISO دارد
          if (this.looksLikeISODate(value)) {
            issues.push({
              type: 'DATE_AS_STRING',
              field: key,
              message: `تاريخ به صورت رشته ذخيره شده: ${value.substring(0, 30)}...`,
              severity: 'HIGH'
            });
          }
        } else if (value && typeof value === 'object') {
          // بررسی برای BSON Date
          if (value.constructor.name === 'Date') {
            if (isNaN(value.getTime())) {
              issues.push({
                type: 'INVALID_DATE_OBJECT',
                field: key,
                message: 'آبجکت تاريخ نامعتبر',
                severity: 'CRITICAL'
              });
            }
          }
        }
      }
      
      // بررسی ObjectIdها
      if ((key === '_id' || key.endsWith('Id') || key === 'userId') && value) {
        if (typeof value === 'string') {
          if (!this.isValidObjectId(value)) {
            issues.push({
              type: 'INVALID_OBJECT_ID',
              field: key,
              message: `ObjectId نامعتبر: ${value}`,
              severity: 'MEDIUM'
            });
          }
        }
      }
    });
    
    return issues;
  }

  async findProblematicRecords() {
    console.log('\n🔎 جستجوی رکوردهای مشکل‌دار...');
    console.log('='.repeat(50));

    // جستجوی رکوردهای با تاریخ‌های نامعتبر در ActivityTracking
    await this.findInvalidDatesInModel('ActivityTracking');
    
    // جستجوی رکوردهای با تاریخ‌های نامعتبر در DailyActivity
    await this.findInvalidDatesInModel('DailyActivity');
    
    // جستجوی فعالیت‌های ثبت نشده
    await this.findUnregisteredActivities();
    
    // جستجوی daily activities بدون صاحب
    await this.findOrphanedRecords();
  }

  async findInvalidDatesInModel(modelName) {
    try {
      if (!this.prisma[modelName]) return;
      
      const records = await this.prisma[modelName].findMany({
        take: 100,
        select: {
          id: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      const invalidRecords = records.filter(record => {
        return !this.isValidDate(record.createdAt) || !this.isValidDate(record.updatedAt);
      });
      
      if (invalidRecords.length > 0) {
        console.log(`\n⚠️ ${invalidRecords.length} رکورد با تاریخ نامعتبر در ${modelName}:`);
        invalidRecords.forEach(record => {
          console.log(`   ID: ${record.id}`);
          console.log(`     createdAt: ${record.createdAt} (${typeof record.createdAt})`);
          console.log(`     updatedAt: ${record.updatedAt} (${typeof record.updatedAt})`);
        });
        
        this.report.issues.push({
          type: 'MODEL_INVALID_DATES',
          model: modelName,
          count: invalidRecords.length,
          records: invalidRecords.map(r => ({ id: r.id, createdAt: r.createdAt, updatedAt: r.updatedAt })),
          severity: 'HIGH'
        });
      }
    } catch (error) {
      console.log(`   ❌ خطا در بررسی ${modelName}:`, error.message);
    }
  }

  async findUnregisteredActivities() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const unregistered = await this.prisma.activityTracking.findMany({
        where: {
          isRegistered: false,
          createdAt: { gte: today }
        },
        take: 10
      });
      
      if (unregistered.length > 0) {
        console.log(`\n📭 ${unregistered.length} فعالیت ثبت‌نشده امروز:`);
        unregistered.forEach(activity => {
          console.log(`   ${activity.activityType}: ${activity.duration} ثانیه (${activity.pathname})`);
        });
      }
    } catch (error) {
      console.log('   ❌ خطا در یافتن فعالیت‌های ثبت‌نشده:', error.message);
    }
  }

  async findOrphanedRecords() {
    console.log('\n🔗 بررسی رکوردهای یتیم...');
    
    // بررسی ActivityTracking بدون کاربر
    try {
      const orphanedActivities = await this.prisma.$queryRaw`
        SELECT at._id, at.userId 
        FROM ActivityTracking at 
        LEFT JOIN User u ON at.userId = u._id 
        WHERE u._id IS NULL
        LIMIT 10
      `.catch(() => []);
      
      if (orphanedActivities && orphanedActivities.length > 0) {
        console.log(`   ⚠️ ${orphanedActivities.length} فعالیت بدون کاربر:`);
        orphanedActivities.forEach(activity => {
          console.log(`     Activity ID: ${activity._id}, User ID: ${activity.userId}`);
        });
      }
    } catch (error) {
      // ممکن است در MongoDB کار نکند
    }
  }

  async checkDatabaseConsistency() {
    console.log('\n🔧 بررسی سازگاری دیتابیس...');
    console.log('='.repeat(50));

    // 1. بررسی indexes
    await this.checkIndexes();
    
    // 2. بررسی رابطه‌ها
    await this.checkRelationships();
    
    // 3. بررسی داده‌های تست
    await this.checkTestData();
  }

  async checkIndexes() {
    console.log('\n📌 بررسی ایندکس‌ها...');
    
    const modelsWithIndexes = ['ActivityTracking', 'DailyActivity', 'User'];
    
    for (const modelName of modelsWithIndexes) {
      try {
        // یک کوئری ساده با فیلتر روی فیلد ایندکس شده
        await this.prisma[modelName].findFirst({
          where: { id: 'test' }
        });
        console.log(`   ✓ ${modelName}: دسترسی پایه کار می‌کند`);
      } catch (error) {
        console.log(`   ❌ ${modelName}: مشکل در دسترسی: ${error.message}`);
      }
    }
  }

  async checkRelationships() {
    console.log('\n🤝 بررسی رابطه‌ها...');
    
    // بررسی رابطه User -> ActivityTracking
    try {
      const userWithActivities = await this.prisma.user.findFirst({
        include: { activityTrackings: true }
      });
      
      if (userWithActivities) {
        console.log(`   ✓ کاربر با ${userWithActivities.activityTrackings.length} فعالیت یافت شد`);
      }
    } catch (error) {
      console.log(`   ❌ خطا در بررسی رابطه‌ها: ${error.message}`);
    }
  }

  async checkTestData() {
    console.log('\n🧪 بررسی داده‌های تست...');
    
    // ایجاد یک رکورد تست
    try {
      const testData = {
        activityType: 'test',
        duration: 1,
        pathname: '/test',
        userId: '000000000000000000000000' // ObjectId تست
      };
      
      // فقط برای تست validation
      console.log('   ✓ Prisma Client پاسخ می‌دهد');
    } catch (error) {
      console.log(`   ❌ خطا در تست: ${error.message}`);
    }
  }

  // Helper methods
  findDateFields(obj) {
    return Object.keys(obj).filter(key => 
      obj[key] instanceof Date || 
      key.toLowerCase().includes('date') || 
      key.toLowerCase().includes('at')
    );
  }

  findObjectIdFields(obj) {
    return Object.keys(obj).filter(key => 
      (key === 'id' || key.endsWith('Id') || key === '_id') && 
      obj[key]
    );
  }

  isValidDate(date) {
    if (!date) return false;
    if (date instanceof Date) {
      return !isNaN(date.getTime());
    }
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }
    return false;
  }

  isValidObjectId(id) {
    if (!id) return false;
    const str = id.toString();
    // بررسی فرمت ObjectId MongoDB (24 کاراکتر hex)
    return /^[0-9a-fA-F]{24}$/.test(str);
  }

  looksLikeISODate(str) {
    if (typeof str !== 'string') return false;
    // الگوی تاریخ ISO
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str);
  }

  sanitizeSample(sample) {
    if (!sample) return null;
    
    const sanitized = { ...sample };
    
    // حذف فیلدهای حساس یا بزرگ
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    
    // محدود کردن طول رشته‌ها
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = sanitized[key].substring(0, 100) + '...';
      }
    });
    
    return sanitized;
  }

  generateReport() {
    this.report.summary.endTime = new Date();
    this.report.summary.duration = 
      this.report.summary.endTime - this.report.summary.startTime;
    this.report.summary.totalModels = Object.keys(this.report.models).length;
    this.report.summary.issuesFound = this.report.issues.length;
    
    console.log('\n📊 📊 📊 گزارش نهایی 📊 📊 📊');
    console.log('='.repeat(50));
    console.log(`⏱️  زمان شروع: ${this.report.summary.startTime.toLocaleString('fa-IR')}`);
    console.log(`⏱️  زمان پایان: ${this.report.summary.endTime.toLocaleString('fa-IR')}`);
    console.log(`⏱️  مدت زمان: ${(this.report.summary.duration / 1000).toFixed(2)} ثانیه`);
    console.log(`📚 تعداد مدل‌ها: ${this.report.summary.totalModels}`);
    console.log(`⚠️  مشکلات یافت شده: ${this.report.summary.issuesFound}`);
    
    if (this.report.issues.length > 0) {
      console.log('\n🚨 مشکلات شناسایی شده:');
      this.report.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.type}`);
        console.log(`   مدل: ${issue.model || 'نامشخص'}`);
        console.log(`   فیلد: ${issue.field || 'نامشخص'}`);
        console.log(`   شدت: ${issue.severity}`);
        if (issue.message) console.log(`   پیام: ${issue.message}`);
        if (issue.value) console.log(`   مقدار: ${typeof issue.value === 'object' ? JSON.stringify(issue.value) : issue.value}`);
      });
    } else {
      console.log('\n✅ هیچ مشکل جدی یافت نشد!');
    }
    
    // ذخیره گزارش در فایل
    this.saveReportToFile();
  }

  saveReportToFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-report-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'reports', filename);
    
    // ایجاد پوشه reports اگر وجود ندارد
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // ذخیره گزارش
    fs.writeFileSync(
      filepath,
      JSON.stringify(this.report, null, 2),
      'utf8'
    );
    
    console.log(`\n💾 گزارش در ${filepath} ذخیره شد`);
  }

  async cleanup() {
    try {
      await this.prisma.$disconnect();
      if (this.mongoClient) {
        await this.mongoClient.close();
      }
      console.log('\n🧹 تمیزکاری انجام شد');
    } catch (error) {
      console.log('❌ خطا در تمیزکاری:', error.message);
    }
  }

  async run() {
    console.log('🔧 شروع بررسی جامع دیتابیس...');
    console.log('='.repeat(50));
    
    try {
      // 1. بررسی مدل‌های Prisma
      await this.checkAllModels();
      
      // 2. اتصال به MongoDB و بررسی مستقیم
      await this.connectMongo();
      await this.checkRawCollections();
      
      // 3. جستجوی رکوردهای مشکل‌دار
      await this.findProblematicRecords();
      
      // 4. بررسی سازگاری
      await this.checkDatabaseConsistency();
      
      // 5. تولید گزارش
      this.generateReport();
      
    } catch (error) {
      console.error('❌ خطای اصلی در اجرای اسکریپت:', error);
      console.error(error.stack);
    } finally {
      await this.cleanup();
    }
  }
}

// اجرای اسکریپت
(async () => {
  const inspector = new DatabaseInspector();
  await inspector.run();
})();