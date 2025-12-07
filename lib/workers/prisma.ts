// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
  
  // Middleware برای اعتبارسنجی تاریخ‌ها
  prisma.$use(async (params, next) => {
    // قبل از هر عملیات، بررسی کن
    if (params.action === 'create' || params.action === 'update') {
      const now = new Date()
      
      // اگر updatedAt وجود دارد، اعتبارسنجی کن
      if (params.args.data.updatedAt !== undefined) {
        if (!(params.args.data.updatedAt instanceof Date)) {
          console.warn('⚠️ updatedAt معتبر نیست، اصلاح به تاریخ فعلی')
          params.args.data.updatedAt = now
        }
      }
      
      // برای create، createdAt را تنظیم کن
      if (params.action === 'create' && !params.args.data.createdAt) {
        params.args.data.createdAt = now
      }
    }
    
    return next(params)
  })
  
  return prisma
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma