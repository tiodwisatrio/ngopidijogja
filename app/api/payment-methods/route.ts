import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all payment methods
export async function GET() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany();
    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods', details: String(error) },
      { status: 500 }
    );
  }
}

// POST create payment method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        code: body.code,
        label: body.label,
      },
    });

    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}
