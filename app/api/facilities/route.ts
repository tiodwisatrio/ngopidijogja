import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all facilities
export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: {
        label: 'asc',
      },
    });

    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilities', details: String(error) },
      { status: 500 }
    );
  }
}

// POST create new facility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.code || !body.label) {
      return NextResponse.json(
        { error: 'Code and label are required' },
        { status: 400 }
      );
    }

    const facility = await prisma.facility.create({
      data: {
        code: body.code,
        label: body.label,
        icon: body.icon || null,
      },
    });

    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: 'Failed to create facility', details: String(error) },
      { status: 500 }
    );
  }
}
