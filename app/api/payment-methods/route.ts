import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { convertBigInt } from '@/lib/serialize';

// GET all payment methods
export async function GET() {
  const prisma = new PrismaClient();
  try {
    const paymentMethods = await prisma.paymentMethod.findMany();
    return NextResponse.json(convertBigInt(paymentMethods));
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST create payment method
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const body = await request.json();

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        code: body.code,
        label: body.label,
      },
    });

    return NextResponse.json(convertBigInt(paymentMethod), { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
