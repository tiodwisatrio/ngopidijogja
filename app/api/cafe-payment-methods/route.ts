import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { convertBigInt } from '@/lib/serialize';

// GET payment methods for a cafe
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const searchParams = request.nextUrl.searchParams;
    const cafeId = searchParams.get('cafeId');

    if (!cafeId) {
      return NextResponse.json(
        { error: 'cafeId query parameter is required' },
        { status: 400 }
      );
    }

    const paymentMethods = await prisma.cafePaymentMethod.findMany({
      where: { cafeId: BigInt(cafeId) },
      include: {
        paymentMethod: true,
      },
    });

    return NextResponse.json(convertBigInt(paymentMethods));
  } catch (error) {
    console.error('Error fetching cafe payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cafe payment methods' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST add payment method to cafe
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const body = await request.json();

    const cafePaymentMethod = await prisma.cafePaymentMethod.create({
      data: {
        cafeId: BigInt(body.cafeId),
        paymentMethodId: BigInt(body.paymentMethodId),
      },
      include: {
        paymentMethod: true,
      },
    });

    return NextResponse.json(convertBigInt(cafePaymentMethod), { status: 201 });
  } catch (error) {
    console.error('Error adding payment method to cafe:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method to cafe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE remove payment method from cafe
export async function DELETE(request: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const searchParams = request.nextUrl.searchParams;
    const cafeId = searchParams.get('cafeId');
    const paymentMethodId = searchParams.get('paymentMethodId');

    if (!cafeId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'cafeId and paymentMethodId query parameters are required' },
        { status: 400 }
      );
    }

    await prisma.cafePaymentMethod.delete({
      where: {
        cafeId_paymentMethodId: {
          cafeId: BigInt(cafeId),
          paymentMethodId: BigInt(paymentMethodId),
        },
      },
    });

    return NextResponse.json({ message: 'Payment method removed from cafe' });
  } catch (error) {
    console.error('Error removing payment method from cafe:', error);
    return NextResponse.json(
      { error: 'Failed to remove payment method from cafe' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
