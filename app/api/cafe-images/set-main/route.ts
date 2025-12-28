import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { convertBigInt } from '@/lib/serialize';

// PUT set main image for cafe
export async function PUT(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const body = await request.json();
    const { cafeId, imageId } = body;

    if (!cafeId || !imageId) {
      return NextResponse.json(
        { error: 'cafeId and imageId are required' },
        { status: 400 }
      );
    }

    // Update cafe with main image
    const cafe = await prisma.cafe.update({
      where: { id: BigInt(cafeId) },
      data: {
        mainImageId: BigInt(imageId),
      },
    });

    return NextResponse.json(convertBigInt(cafe));
  } catch (error) {
    console.error('Error setting main image:', error);
    return NextResponse.json(
      { error: 'Failed to set main image', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
