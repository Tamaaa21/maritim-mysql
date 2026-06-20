import type { NextRequest } from "next/server";

export function getUserId(request: NextRequest | Request): string {
  return request.headers.get("x-auth-user-id") || "";
}

export function getUsername(request: NextRequest | Request): string {
  return request.headers.get("x-auth-user-username") || "";
}

export function getRole(request: NextRequest | Request): string {
  return request.headers.get("x-auth-user-role") || "";
}

export function isAdmin(request: NextRequest | Request): boolean {
  const role = getRole(request);
  return role === "super_admin" || role === "admin";
}

export function isSuperAdmin(request: NextRequest | Request): boolean {
  return getRole(request) === "super_admin";
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") || "unknown";
}
