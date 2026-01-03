import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/api-auth";

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
        priceMin: true,
        priceMax: true,
        priceRange: true,
        googleMapsUrl: true,
        instagramUrl: true,
        instagramUsername: true,
        mainImageId: true,
        // Include images for CafeCard display
        images: {
          select: {
            id: true,
            imageUrl: true,
            alt: true,
          },
        },
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
        // Exclude openingHours - will be fetched when detail sheet is opened
      },
    });

    // NO CACHE - always return fresh data
    return NextResponse.json(cafes, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching cafes:", error);
    return NextResponse.json(
      { error: "Failed to fetch cafes", details: String(error) },
      { status: 500 }
    );
  }
}

// POST create new cafe
export async function POST(request: NextRequest) {
  // Require admin authorization
  const { error } = await requireAdmin(request);
  if (error) return error;

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
    console.error("Error creating cafe:", error);
    return NextResponse.json(
      { error: "Failed to create cafe", details: String(error) },
      { status: 500 }
    );
  }
}
