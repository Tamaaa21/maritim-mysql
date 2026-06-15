import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "bmkg-maritim-tegal-secret-change-in-production";
const PUBLIC_ADMIN_ROUTES = ["/api/admin/login"];

function base64UrlDecode(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return atob(s);
}

function hexEncode(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return hexEncode(hashBuffer);
}

async function verifyToken(token: string): Promise<{ valid: boolean; userId?: string; role?: string }> {
  try {
    const decoded = base64UrlDecode(token);
    const parts = decoded.split(":");
    const signature = parts.pop();
    const payload = parts.join(":");

    const expectedSig = await sha256(payload + TOKEN_SECRET);

    if (signature !== expectedSig) return { valid: false };

    const [userId, role, , timestamp] = parts;
    if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) return { valid: false };

    return { valid: true, userId, role };
  } catch {
    return { valid: false };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const isWriteOperation = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (pathname.startsWith("/api/admin") && !PUBLIC_ADMIN_ROUTES.includes(pathname)) {
    // GET requests: izinkan tanpa auth (untuk frontend publik)
    if (!isWriteOperation) {
      return NextResponse.next();
    }

    // Write operations (POST/PUT/PATCH/DELETE): wajib auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - silakan login ulang" },
        { status: 401 }
      );
    }

    const result = await verifyToken(authHeader.slice(7));
    if (!result.valid) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid atau kedaluwarsa" },
        { status: 401 }
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-auth-user", result.userId || "");
    requestHeaders.set("x-auth-role", result.role || "");

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/admin/:path*",
};
