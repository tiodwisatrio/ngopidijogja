import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET all cafes (optimized for map view - excludes heavy data)
export async function GET() {
  try {
    const cafes = await prisma.cafe.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        latitude: true,
        longitude: true,
        parking: true,
        googleMapsUrl: true,
        instagramUrl: true,
        instagramUsername: true,
        // Only include essential relations for map markers
        paymentMethods: {
          select: {
            paymentMethod: {
              select: {
                code: true,
                label: true,
              },
            },
          },
        },
        facilities: {
          select: {
            facility: {
              select: {
                id: true,
                code: true,
                label: true,
                icon: true,
              },
            },
          },
        },
        // Exclude images and openingHours - too heavy for initial load
        // These will be fetched separately when detail sheet is opened
      },
    });

    // Cache response for 60 seconds with stale-while-revalidate
    return NextResponse.json(cafes, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
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
        latitude: body.latitude ? new Prisma.Decimal(body.latitude) : null,
        longitude: body.longitude ? new Prisma.Decimal(body.longitude) : null,
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
