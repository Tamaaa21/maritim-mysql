import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, CSRF_COOKIE_NAME, verifySessionToken } from "@/lib/auth-edge";

const PUBLIC_ADMIN_PATHS = ["/api/admin/login"];

// Paths that require auth but NOT CSRF (safe state-changing operations)
const CSRF_EXEMPT_PATHS = ["/api/admin/logout"];

const PUBLIC_GET_PATHS = [
  "/api/admin/hero-images",
  "/api/admin/publications",
  "/api/admin/prakiraan-images",
  "/api/admin/prakiraan-categories",
  "/api/admin/layanan-cards",
  "/api/admin/kegiatan-documents",
  "/api/admin/struktur-organisasi",
  "/api/admin/display",
  "/api/admin/stats/buku-tamu",
];

const ALLOWED_ROLES_FOR_DELETE = ["super_admin", "admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Only protect /api/admin/* routes
  if (!pathname.startsWith("/api/admin/")) {
    return NextResponse.next();
  }

  // Allow public admin paths (login) and logout
  if (PUBLIC_ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow public GET read-only requests for website content
  if (method === "GET" && PUBLIC_GET_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Extract token from cookie first, then Authorization header as fallback
  let token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const result = await verifySessionToken(token);
  if (!result.valid) {
    return NextResponse.json({ success: false, message: "Session expired or invalid" }, { status: 401 });
  }

  // RBAC: Only super_admin and admin can perform destructive operations
  if (["DELETE", "PATCH", "PUT"].includes(method)) {
    if (!ALLOWED_ROLES_FOR_DELETE.includes(result.role || "")) {
      return NextResponse.json({ success: false, message: "Forbidden: insufficient role" }, { status: 403 });
    }
  }

  // CSRF: State-changing requests must include X-CSRF-Token header matching the cookie
  // Exempt paths that are safe operations (e.g. logout)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const isCsrfExempt = CSRF_EXEMPT_PATHS.some(p => pathname.startsWith(p));
    if (!isCsrfExempt) {
      const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
      const csrfHeader = request.headers.get("x-csrf-token");

      if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) {
        // CSRF valid
      } else if (!csrfCookie && !csrfHeader) {
        // No CSRF cookies set (e.g. Bearer token auth without cookies) — allow
      } else {
        return NextResponse.json({ success: false, message: "Invalid CSRF token" }, { status: 403 });
      }
    }
  }

  // Attach user info to request headers for downstream API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-auth-user-id", result.userId || "");
  requestHeaders.set("x-auth-user-role", result.role || "");
  requestHeaders.set("x-auth-user-username", result.username || "");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Renew cookie if using cookie auth
  if (request.cookies.get(COOKIE_NAME)?.value) {
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    // Renew CSRF cookie alongside auth cookie
    const existingCsrf = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (existingCsrf) {
      response.cookies.set(CSRF_COOKIE_NAME, existingCsrf, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 86400,
      });
    }
  }

  return response;
}

export const config = {
  matcher: "/api/admin/:path*",
};
