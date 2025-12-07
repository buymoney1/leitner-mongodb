// lib/validators.ts
import { z } from 'zod'
import { NextRequest } from 'next/server'

// ============ Schemaهای اصلی ============

// User
export const userSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  image: z.string().url().optional(),
  learningGoal: z.string().max(500).optional(),
  targetScore: z.number().min(0).max(10).optional(),
  suggestedReviewTime: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']).optional(),
  isOnboardingComplete: z.boolean().optional(),
  notificationToken: z.string().optional(),
  notificationEnabled: z.boolean().optional()
}).strict() // فقط فیلدهای تعریف شده قابل قبول هستند

// ActivityTracking
export const activityTrackingSchema = z.object({
  activityType: z.enum(['video', 'podcast', 'article', 'words', 'song']),
  duration: z.number().int().positive(),
  pathname: z.string().max(500).optional(),
  contentId: z.string().length(24).optional() // ObjectId 24 کاراکتری
}).strict()

// DailyActivity
export const dailyActivitySchema = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'تاریخ معتبر نیست'
  }),
  videoWatched: z.boolean().optional(),
  podcastListened: z.boolean().optional(),
  wordsReviewed: z.boolean().optional(),
  articleRead: z.boolean().optional(),
  songListened: z.boolean().optional(),
  videoId: z.string().length(24).optional(),
  podcastId: z.string().length(24).optional(),
  articleId: z.string().length(24).optional(),
  songId: z.string().length(24).optional(),
  progress: z.number().min(0).max(100).optional()
}).strict()

// Book
export const bookSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional()
}).strict()

// Card
export const cardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  hint: z.string().optional(),
  boxNumber: z.number().int().min(1).max(10).optional(),
  lastReviewedAt: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'تاریخ معتبر نیست'
  }).optional(),
  nextReviewAt: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'تاریخ معتبر نیست'
  }).optional(),
  bookId: z.string().length(24).optional()
}).strict()

// Review
export const reviewSchema = z.object({
  isCorrect: z.boolean(),
  cardId: z.string().length(24)
}).strict()

// Video
export const videoSchema = z.object({
  title: z.string().min(1).max(200),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  subtitlesVtt: z.string().optional()
}).strict()

// Podcast
export const podcastSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  audioUrl: z.string().url(),
  coverUrl: z.string().url().optional(),
  duration: z.number().int().positive().optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  isPublished: z.boolean().optional()
}).strict()

// Article
export const articleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  coverUrl: z.string().url().optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  readingTime: z.number().int().positive().optional(),
  isPublished: z.boolean().optional()
}).strict()

// Song
export const songSchema = z.object({
  title: z.string().min(1).max(200),
  artist: z.string().min(1).max(100),
  album: z.string().optional(),
  duration: z.number().int().positive(),
  audioUrl: z.string().url(),
  coverUrl: z.string().url().optional(),
  lyrics: z.string().min(1),
  isPublished: z.boolean().optional()
}).strict()

// NotificationLog
export const notificationLogSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  type: z.enum(['reminder', 'alert', 'info']).optional(),
  pushToken: z.string().optional()
}).strict()

// PushSubscription
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  }),
  expiresAt: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'تاریخ معتبر نیست'
  }).optional()
}).strict()

// ============ Utility Functions ============

/**
 * اعتبارسنجی درخواست با Zod
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{
  success: boolean
  data?: T
  errors?: string[]
}> {
  try {
    const body = await req.json()
    
    // اعتبارسنجی با Zod
    const result = schema.safeParse(body)
    
    if (!result.success) {
      const errors = result.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      )
      
      return {
        success: false,
        errors
      }
    }
    
    return {
      success: true,
      data: result.data
    }
    
  } catch (error) {
    return {
      success: false,
      errors: ['خطا در پردازش JSON']
    }
  }
}

/**
 * اعتبارسنجی پارامترهای URL
 */
export function validateParams<T>(
  params: Record<string, any>,
  schema: z.ZodSchema<T>
): {
  success: boolean
  data?: T
  errors?: string[]
} {
  const result = schema.safeParse(params)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    )
    
    return {
      success: false,
      errors
    }
  }
  
  return {
    success: true,
    data: result.data
  }
}

/**
 * اعتبارسنجی ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * اعتبارسنجی تاریخ
 */
export function isValidDate(date: any): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime())
  }
  
  if (typeof date === 'string') {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }
  
  if (typeof date === 'number') {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime())
  }
  
  return false
}

/**
 * پاکسازی داده‌ها از فیلدهای غیرمجاز
 */
export function sanitizeData<T extends Record<string, any>>(
  data: T,
  allowedFields: string[]
): Partial<T> {
  const sanitized: Partial<T> = {}
  
  Object.keys(data).forEach(key => {
    if (allowedFields.includes(key)) {
      sanitized[key as keyof T] = data[key]
    }
  })
  
  return sanitized
}

/**
 * ایجاد response استاندارد برای خطاها
 */
export function createErrorResponse(
  errors: string[],
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      errors,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

/**
 * ایجاد response استاندارد برای موفقیت
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

/**
 * Middleware برای اعتبارسنجی تمام APIها
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, req: NextRequest) => Promise<Response>
) {
  return async function (req: NextRequest) {
    // اعتبارسنجی
    const validation = await validateRequest(req, schema)
    
    if (!validation.success) {
      return createErrorResponse(validation.errors || ['اعتبارسنجی ناموفق'])
    }
    
    // اجرای handler
    try {
      return await handler(validation.data!, req)
    } catch (error) {
      console.error('Error in API handler:', error)
      return createErrorResponse(
        ['خطای سرور داخلی'],
        500
      )
    }
  }
}

/**
 * Factory برای ایجاد API handlerهای امن
 */
export function createApiHandler<T>(
  options: {
    schema: z.ZodSchema<T>
    requireAuth?: boolean
    allowedMethods?: string[]
    rateLimit?: {
      maxRequests: number
      windowMs: number
    }
  },
  handler: (data: T, req: NextRequest, userId?: string) => Promise<Response>
) {
  return async function (req: NextRequest) {
    // بررسی method
    if (options.allowedMethods && !options.allowedMethods.includes(req.method)) {
      return createErrorResponse(['متد غیرمجاز'], 405)
    }
    
    // اعتبارسنجی
    const validation = await validateRequest(req, options.schema)
    
    if (!validation.success) {
      return createErrorResponse(validation.errors || ['اعتبارسنجی ناموفق'])
    }
    
    // بررسی احراز هویت
    let userId: string | undefined
    
    if (options.requireAuth) {
      // اینجا باید auth logic شما قرار بگیرد
      // برای مثال:
      // const session = await auth()
      // if (!session?.user?.id) {
      //   return createErrorResponse(['لطفاً وارد شوید'], 401)
      // }
      // userId = session.user.id
      
      // برای نمونه:
      userId = 'demo-user-id'
    }
    
    // اجرای handler
    try {
      return await handler(validation.data!, req, userId)
    } catch (error) {
      console.error('Error in API handler:', error)
      return createErrorResponse(
        ['خطای سرور داخلی'],
        500
      )
    }
  }
}

// ============ Export همه schemaها ============
export const schemas = {
  user: userSchema,
  activityTracking: activityTrackingSchema,
  dailyActivity: dailyActivitySchema,
  book: bookSchema,
  card: cardSchema,
  review: reviewSchema,
  video: videoSchema,
  podcast: podcastSchema,
  article: articleSchema,
  song: songSchema,
  notificationLog: notificationLogSchema,
  pushSubscription: pushSubscriptionSchema
}

// Type برای API response استاندارد
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
  timestamp: string
}