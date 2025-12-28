import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// GET single facility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    const facility = await prisma.facility.findUnique({
      where: { id: parseInt(id) },
      include: {
        cafes: {
          include: {
            cafe: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!facility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error fetching facility:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT update facility
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    const body = await request.json();

    const facility = await prisma.facility.update({
      where: { id: parseInt(id) },
      data: {
        code: body.code,
        label: body.label,
        icon: body.icon || null,
      },
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: 'Failed to update facility', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE facility
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;

    await prisma.facility.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: 'Failed to delete facility', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
