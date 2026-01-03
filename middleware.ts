import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export const middleware = withAuth(
  function middleware(request: NextRequest & { nextauth: any }) {
    // Allow access to /admin routes only if authenticated
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!request.nextauth.token) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // Protect API routes that require authentication
    if (request.nextUrl.pathname.startsWith("/api")) {
      // Public API routes (no auth required)
      const publicApiRoutes = [
        "/api/auth",
        "/api/cafes",
        "/api/facilities",
        "/api/payment-methods",
        "/api/opening-hours",
        "/api/cafe-facilities",
        "/api/cafe-images",
        "/api/cafe-payment-methods",
      ];

      const isPublicGetRoute =
        publicApiRoutes.some((route) =>
          request.nextUrl.pathname.startsWith(route)
        ) && request.method === "GET";

      // Allow public GET requests, block others without auth
      if (!isPublicGetRoute && !request.nextauth.token) {
        return NextResponse.json(
          { error: "Unauthorized - Please login" },
          { status: 401 }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow unauthenticated access to public routes
        // Block access to /admin without token
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }

        // For API routes, handle in middleware function above
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
