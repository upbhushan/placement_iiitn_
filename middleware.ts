import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define which paths are protected and their access requirements
  const isPublicPath = ["/login", "/forgot-password", "/check-email", "/about", "/contact"].includes(path);
  const isApiPath = path.startsWith("/api");
  const isAdminPath = path.startsWith("/admin");
  const isDashboardPath = path.startsWith("/dashboard");
  const isStudentPath = path.startsWith("/student");
  
  // Skip middleware for public paths and API routes (except protected API routes if you have any)
  if (isPublicPath || (isApiPath && !path.startsWith("/api/protected"))) {
    return NextResponse.next();
  }
  
  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect to login if no token and trying to access protected route
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check admin-only routes
  if (isAdminPath && token.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  // Check student routes
  if (isStudentPath && token.role !== "student") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  // Dashboard accessible to both roles
  return NextResponse.next();
}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/student/:path*",
    "/api/protected/:path*",
  ],
};