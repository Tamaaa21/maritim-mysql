import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";

const SALT_ROUNDS = 12;
const TOKEN_SECRET = process.env.TOKEN_SECRET || "bmkg-maritim-tegal-secret-change-in-production";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(userId: string, role: string): string {
  const random = randomBytes(16).toString("hex");
  const iat = Date.now();
  const payload = `${userId}:${role}:${random}:${iat}`;
  const signature = createHash("sha256").update(payload + TOKEN_SECRET).digest("hex");
  return Buffer.from(payload + ":" + signature).toString("base64url");
}

export function verifySessionToken(token: string): { valid: boolean; userId?: string; role?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    const signature = parts.pop();
    const payload = parts.join(":");
    const expectedSig = createHash("sha256").update(payload + TOKEN_SECRET).digest("hex");

    if (signature !== expectedSig) return { valid: false };

    const [userId, role, , timestamp] = parts;
    if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) return { valid: false };

    return { valid: true, userId, role };
  } catch {
    return { valid: false };
  }
}

export function getAuthHeader(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function getAuthUser(request: Request): Promise<{ authenticated: boolean; userId?: string; role?: string }> {
  const token = getAuthHeader(request);
  if (!token) return { authenticated: false };
  const result = verifySessionToken(token);
  return { authenticated: result.valid, userId: result.userId, role: result.role };
}

export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forgeHttpError(status: number, message: string) {
  return NextResponse.json({ success: false, message }, { status });
}
