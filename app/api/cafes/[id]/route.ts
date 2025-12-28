import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { convertBigInt } from '@/lib/serialize';

// GET cafe by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    const cafe = await prisma.cafe.findUnique({
      where: { id: BigInt(id) },
      include: {
        openingHours: true,
        paymentMethods: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });

    if (!cafe) {
      return NextResponse.json(
        { error: 'Cafe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(convertBigInt(cafe));
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// UPDATE cafe by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    const body = await request.json();

    const cafe = await prisma.cafe.update({
      where: { id: BigInt(id) },
      data: {
        name: body.name,
        address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        googleMapsUrl: body.googleMapsUrl,
        instagramUrl: body.instagramUrl,
        instagramUsername: body.instagramUsername,
        parking: body.parking,
        priceMin: body.priceMin ? parseInt(body.priceMin) : null,
        priceMax: body.priceMax ? parseInt(body.priceMax) : null,
        priceRange: body.priceRange || null,
        facilities: body.facilities,
      },
      include: {
        openingHours: true,
        paymentMethods: {
          include: {
            paymentMethod: true,
          },
        },
      },
    });

    return NextResponse.json(convertBigInt(cafe));
  } catch (error) {
    console.error('Error updating cafe:', error);
    return NextResponse.json(
      { error: 'Failed to update cafe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE cafe by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;

    await prisma.cafe.delete({
      where: { id: BigInt(id) },
    });

    return NextResponse.json({ message: 'Cafe deleted successfully' });
  } catch (error) {
    console.error('Error deleting cafe:', error);
    return NextResponse.json(
      { error: 'Failed to delete cafe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
