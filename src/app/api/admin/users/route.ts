// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '../../../../../lib/server-auth';


const prisma = new PrismaClient();

// app/api/admin/users/route.ts
export async function GET(request: NextRequest) {
    try {
        const session = await getAuthSession();

        if (!session || session.user.role !== 'admin') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
  
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          hasPurchasedPackage: true,
          packageMonths: true,
          packageExpiryDate: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      return NextResponse.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'خطا در دریافت کاربران' },
        { status: 500 }
      );
    }
  }