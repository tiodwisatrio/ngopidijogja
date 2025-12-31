import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET cafe by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cafe = await prisma.cafe.findUnique({
      where: { id: parseInt(id) },
      include: {
        openingHours: true,
        paymentMethods: {
          include: {
            paymentMethod: true,
          },
        },
        images: true,
        facilities: {
          include: {
            facility: true,
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

    // NO CACHE - always return fresh data
    return NextResponse.json(cafe, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching cafe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafe' },
      { status: 500 }
    );
  }
}

// UPDATE cafe by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const cafe = await prisma.cafe.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        address: body.address,
        latitude: body.latitude ? new Prisma.Decimal(body.latitude) : undefined,
        longitude: body.longitude ? new Prisma.Decimal(body.longitude) : undefined,
        googleMapsUrl: body.googleMapsUrl,
        instagramUrl: body.instagramUrl,
        instagramUsername: body.instagramUsername,
        parking: body.parking,
        priceMin: body.priceMin ? parseInt(body.priceMin) : null,
        priceMax: body.priceMax ? parseInt(body.priceMax) : null,
        priceRange: body.priceRange || null,
        mainImageId: body.mainImageId ? parseInt(body.mainImageId) : null,
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

    return NextResponse.json(cafe, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error updating cafe:', error);
    return NextResponse.json(
      { error: 'Failed to update cafe' },
      { status: 500 }
    );
  }
}

// DELETE cafe by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.cafe.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Cafe deleted successfully' }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error deleting cafe:', error);
    return NextResponse.json(
      { error: 'Failed to delete cafe' },
      { status: 500 }
    );
  }
}
