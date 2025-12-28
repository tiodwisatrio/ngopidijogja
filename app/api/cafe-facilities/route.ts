import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { convertBigInt } from '@/lib/serialize';

// GET cafe facilities by cafeId
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const { searchParams } = new URL(request.url);
    const cafeId = searchParams.get('cafeId');

    if (!cafeId) {
      return NextResponse.json(
        { error: 'cafeId is required' },
        { status: 400 }
      );
    }

    const cafeFacilities = await prisma.cafeFacility.findMany({
      where: { cafeId: BigInt(cafeId) },
      include: {
        facility: true,
      },
    });

    return NextResponse.json(convertBigInt(cafeFacilities));
  } catch (error) {
    console.error('Error fetching cafe facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafe facilities', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST bulk update cafe facilities
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const body = await request.json();
    const { cafeId, facilityIds } = body;

    if (!cafeId) {
      return NextResponse.json(
        { error: 'cafeId is required' },
        { status: 400 }
      );
    }

    // Delete existing cafe facilities
    await prisma.cafeFacility.deleteMany({
      where: { cafeId: BigInt(cafeId) },
    });

    // Insert new cafe facilities
    if (facilityIds && Array.isArray(facilityIds) && facilityIds.length > 0) {
      await prisma.cafeFacility.createMany({
        data: facilityIds.map((facilityId: string) => ({
          cafeId: BigInt(cafeId),
          facilityId: BigInt(facilityId),
        })),
      });
    }

    // Fetch and return updated facilities
    const cafeFacilities = await prisma.cafeFacility.findMany({
      where: { cafeId: BigInt(cafeId) },
      include: {
        facility: true,
      },
    });

    return NextResponse.json(convertBigInt(cafeFacilities));
  } catch (error) {
    console.error('Error updating cafe facilities:', error);
    return NextResponse.json(
      { error: 'Failed to update cafe facilities', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
