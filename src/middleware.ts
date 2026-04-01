import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-me"
);

// Routes that don't require authentication
const publicPaths = ["/login", "/api/auth"];

function isPublic(pathname: string) {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let static files and Next.js internals pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith(".ico") ||
    pathname.startsWith(".svg") ||
    pathname.startsWith(".png") ||
    pathname.startsWith(".jpg")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, SECRET);
      isAuthenticated = true;
    } catch {
      // Token is invalid or expired - treat as unauthenticated
    }
  }

  // Authenticated user hitting /login → send to dashboard
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated user hitting / → send to login
  if (!isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Public paths don't need auth
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // API routes: return 401 JSON instead of redirect
  if (!isAuthenticated && pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Protected page routes: redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and Next.js internals.
     * This is a safety net - the function also filters internally.
     */
    "/((?!_next/static|_next/image).*)",
  ],
};