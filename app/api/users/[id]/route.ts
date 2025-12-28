import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// GET user by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// UPDATE user by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;
    const body = await request.json();

    // Build update data object
    const updateData: {
      email?: string;
      name?: string;
      role?: string;
      password?: string;
    } = {};

    // Email validation if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: body.email,
          NOT: { id: id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }

      updateData.email = body.email;
    }

    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.role) {
      updateData.role = body.role;
    }

    // Password update (optional)
    if (body.password) {
      if (body.password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE user by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const { id } = await params;

    // Count total users
    const totalUsers = await prisma.user.count();

    // Prevent deleting the last admin
    if (totalUsers <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin user' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
