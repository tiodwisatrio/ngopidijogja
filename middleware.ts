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

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow unauthenticated access to login page
        // Block access to /admin without token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
