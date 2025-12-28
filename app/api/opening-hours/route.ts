import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

// GET opening hours by cafe ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cafeId = searchParams.get("cafeId");

    if (!cafeId) {
      return NextResponse.json(
        { error: "cafeId query parameter is required" },
        { status: 400 }
      );
    }

    const openingHours = await prisma.openingHour.findMany({
      where: { cafeId: parseInt(cafeId) },
    });

    return NextResponse.json(openingHours);
  } catch (error) {
    console.error("Error fetching opening hours:", error);
    return NextResponse.json(
      { error: "Failed to fetch opening hours" },
      { status: 500 }
    );
  }
}

// POST create opening hour
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse time strings in HH:MM format to Time type
    const [openHours, openMinutes] = body.openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = body.closeTime.split(':').map(Number);

    const openTime = new Date();
    openTime.setHours(openHours, openMinutes, 0, 0);

    const closeTime = new Date();
    closeTime.setHours(closeHours, closeMinutes, 0, 0);

    const openingHour = await prisma.openingHour.create({
      data: {
        cafeId: parseInt(body.cafeId),
        dayOfWeek: body.dayOfWeek,
        openTime,
        closeTime,
        isClosed: body.isClosed || false,
        isOpen24Hours: body.isOpen24Hours || false,
        isEverydayOpen: body.isEverydayOpen || false,
      },
    });

    return NextResponse.json(openingHour, { status: 201 });
  } catch (error) {
    console.error("Error creating opening hour:", error);
    return NextResponse.json(
      { error: "Failed to create opening hour", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT update opening hour
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse time strings in HH:MM format to Time type
    const [openHours, openMinutes] = body.openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = body.closeTime.split(':').map(Number);

    const openTime = new Date();
    openTime.setHours(openHours, openMinutes, 0, 0);

    const closeTime = new Date();
    closeTime.setHours(closeHours, closeMinutes, 0, 0);

    const openingHour = await prisma.openingHour.update({
      where: { id: parseInt(body.id) },
      data: {
        openTime,
        closeTime,
        isClosed: body.isClosed || false,
        isOpen24Hours: body.isOpen24Hours || false,
        isEverydayOpen: body.isEverydayOpen || false,
      },
    });

    return NextResponse.json(openingHour, { status: 200 });
  } catch (error) {
    console.error("Error updating opening hour:", error);
    return NextResponse.json(
      { error: "Failed to update opening hour", details: String(error) },
      { status: 500 }
    );
  }
}
