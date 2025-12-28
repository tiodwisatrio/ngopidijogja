import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all cafes
export async function GET() {
  try {
    const cafes = await prisma.cafe.findMany({
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

    return NextResponse.json(cafes);
  } catch (error) {
    console.error('Error fetching cafes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafes', details: String(error) },
      { status: 500 }
    );
  }
}

// POST create new cafe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const cafe = await prisma.cafe.create({
      data: {
        slug: body.slug,
        name: body.name,
        address: body.address,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        googleMapsUrl: body.googleMapsUrl,
        instagramUrl: body.instagramUrl,
        instagramUsername: body.instagramUsername,
        parking: body.parking,
        priceMin: body.priceMin ? parseInt(body.priceMin) : null,
        priceMax: body.priceMax ? parseInt(body.priceMax) : null,
        priceRange: body.priceRange || null,
      },
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

    return NextResponse.json(cafe, { status: 201 });
  } catch (error) {
    console.error('Error creating cafe:', error);
    return NextResponse.json(
      { error: 'Failed to create cafe', details: String(error) },
      { status: 500 }
    );
  }
}
