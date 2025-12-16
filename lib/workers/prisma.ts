// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
  
  // استفاده از $extends برای اضافه کردن middleware
  const prismaWithMiddleware = prisma.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const now = new Date()
        
        // فقط برای عملیات create و update
        if (operation === 'create' || operation === 'update') {
          // برای create، createdAt را تنظیم کن
          if (operation === 'create' && !args.data.createdAt) {
            args.data.createdAt = now
          }
          
          // برای update، updatedAt را تنظیم کن
          if (operation === 'update') {
            args.data.updatedAt = now
          }
          
          // اگر updatedAt وجود دارد اما معتبر نیست، اصلاح کن
          if (args.data.updatedAt !== undefined) {
            if (!(args.data.updatedAt instanceof Date)) {
              console.warn('⚠️ updatedAt معتبر نیست، اصلاح به تاریخ فعلی')
              args.data.updatedAt = now
            }
          }
        }
        
        return query(args)
      }
    }
  })
  
  return prismaWithMiddleware
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma