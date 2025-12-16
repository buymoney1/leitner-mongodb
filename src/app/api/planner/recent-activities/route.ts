import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../../lib/server-auth';
import { prisma } from '../../../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // دریافت فعالیت‌ها - استفاده از حروف کوچک
    const activities = await prisma.activityTracking.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // اضافه کردن محتوای مرتبط بر اساس activityType
    const activitiesWithContent = await Promise.all(
      activities.map(async (activity) => {
        let content = null;
        
        if (activity.contentId && activity.activityType) {
          try {
            switch (activity.activityType) {
              case 'video':
                content = await prisma.video.findUnique({
                  where: { id: activity.contentId },
                  select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    level: true
                  }
                });
                break;
              
              case 'podcast':
                content = await prisma.podcast.findUnique({
                  where: { id: activity.contentId },
                  select: {
                    id: true,
                    title: true,
                    coverUrl: true,
                    level: true
                  }
                });
                break;
              
              case 'article':
                content = await prisma.article.findUnique({
                  where: { id: activity.contentId },
                  select: {
                    id: true,
                    title: true,
                    coverUrl: true,
                    level: true
                  }
                });
                break;
              
              case 'song':
                content = await prisma.song.findUnique({
                  where: { id: activity.contentId },
                  select: {
                    id: true,
                    title: true,
                    artist: true,
                    coverUrl: true
                  }
                });
                break;
              
              case 'words':
                content = {
                  type: 'words_review',
                  title: 'مرور کلمات'
                };
                break;
            }
          } catch (contentError) {
            console.warn(`Error fetching content for ${activity.activityType}:`, contentError);
          }
        }
        
        return {
          ...activity,
          content
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: activitiesWithContent
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت فعالیت‌های اخیر',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}