import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { getUserId, getUsername } from "@/services/admin.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    logActivity(getUserId(request), "Logout dari panel admin", getUsername(request));
  } catch {
    // ignore log errors on logout
  }

  const response = NextResponse.json({ success: true, message: "Logout berhasil" });
  clearAuthCookie(response);
  return response;
}
