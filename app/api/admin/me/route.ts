import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/services/auth.service";
import { getUserId } from "@/services/admin.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 });
    }
    if (!user.is_active) {
      return NextResponse.json({ success: false, message: "Account disabled" }, { status: 403 });
    }

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
