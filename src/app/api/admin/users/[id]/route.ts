// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


import { getAuthSession } from '../../../../../../lib/server-auth';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    
    const { 
      role, 
      hasPurchasedPackage, 
      packageMonths, 
      packageExpiryDate 
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { 
        role,
        hasPurchasedPackage,
        packageMonths,
        packageExpiryDate: packageExpiryDate ? new Date(packageExpiryDate) : null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        hasPurchasedPackage: true,
        packageMonths: true,
        packageExpiryDate: true,
        createdAt: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی کاربر' },
      { status: 500 }
    );
  }
}