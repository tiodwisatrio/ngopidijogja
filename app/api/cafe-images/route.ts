import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

// GET images for a cafe
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

    const images = await prisma.cafeImage.findMany({
      where: { cafeId: parseInt(cafeId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching cafe images:", error);
    return NextResponse.json(
      { error: "Failed to fetch cafe images" },
      { status: 500 }
    );
  }
}

// POST add image to cafe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const image = await prisma.cafeImage.create({
      data: {
        cafeId: parseInt(body.cafeId),
        imageUrl: body.imageUrl,
        alt: body.alt,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Error creating cafe image:", error);
    return NextResponse.json(
      { error: "Failed to create cafe image", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE image
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "imageId query parameter is required" },
        { status: 400 }
      );
    }

    await prisma.cafeImage.delete({
      where: { id: parseInt(imageId) },
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting cafe image:", error);
    return NextResponse.json(
      { error: "Failed to delete cafe image" },
      { status: 500 }
    );
  }
}
