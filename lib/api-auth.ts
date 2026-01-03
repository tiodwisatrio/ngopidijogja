import { getServerSession as getNextAuthSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get the current authenticated session
 */
export async function getServerSession() {
  return await getNextAuthSession(authOptions);
}

/**
 * Require authentication - returns session or error response
 */
export async function requireAuth(_request: NextRequest) {
  const session = await getServerSession();

  if (!session || !session.user) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      ),
    };
  }

  return { session, error: null };
}

/**
 * Require admin role - returns session or error response
 */
export async function requireAdmin(request: NextRequest) {
  const { session, error } = await requireAuth(request);

  if (error) return { session: null, error };

  if (session!.user.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}

/**
 * Check if user can access resource
 * Admin can access all, regular users can only access their own data
 */
export async function requireOwnerOrAdmin(
  request: NextRequest,
  resourceUserId: string
) {
  const { session, error } = await requireAuth(request);

  if (error) return { session: null, error };

  const isOwner = session!.user.id === resourceUserId;
  const isAdmin = session!.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Forbidden - You can only access your own data" },
        { status: 403 }
      ),
    };
  }

  return { session, error: null };
}
