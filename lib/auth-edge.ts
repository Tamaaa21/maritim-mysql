// Edge-compatible auth utilities (no Node.js dependencies)
// Used by middleware.ts

export const COOKIE_NAME = "admin_token";
export const CSRF_COOKIE_NAME = "csrf_token";
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.TOKEN_SECRET;
  if (!secret || secret === "bmkg-maritim-tegal-secret-change-in-production") {
    throw new Error("TOKEN_SECRET environment variable is not set or still using default value");
  }
  return secret;
}

async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

export async function verifySessionToken(token: string): Promise<{
  valid: boolean; userId?: string; role?: string; username?: string
}> {
  try {
    const secret = getSecret();
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    const signature = parts.pop()!;
    const payload = parts.join(":");
    const expectedSig = await sha256Hex(payload + secret);

    if (!timingSafeEqual(signature, expectedSig)) return { valid: false };

    const [userId, role, username, , timestamp] = parts;
    if (Date.now() - parseInt(timestamp) > SESSION_DURATION_MS) return { valid: false };

    return { valid: true, userId, role, username };
  } catch {
    return { valid: false };
  }
}

export async function createSessionToken(userId: string, role: string, username: string): Promise<string> {
  const secret = getSecret();
  const random = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, "0")).join("");
  const iat = Date.now();
  const payload = `${userId}:${role}:${username}:${random}:${iat}`;
  const signature = await sha256Hex(payload + secret);
  return Buffer.from(payload + ":" + signature).toString("base64url");
}
