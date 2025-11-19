import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        learningGoal: true,
        targetScore: true,
        suggestedReviewTime: true,
        isOnboardingComplete: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            books: true,
            cards: true,
            podcasts: true,
            articles: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, learningGoal, targetScore, suggestedReviewTime } = body

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        learningGoal,
        targetScore: targetScore ? parseFloat(targetScore) : undefined,
        suggestedReviewTime
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        learningGoal: true,
        targetScore: true,
        suggestedReviewTime: true,
        isOnboardingComplete: true,
        role: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}