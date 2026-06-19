import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query("SELECT COUNT(*) as count FROM users WHERE is_active = true");
    return NextResponse.json({ count: rows[0].count || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}
