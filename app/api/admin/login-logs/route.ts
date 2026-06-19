import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql";
import type { LoginLog } from "@/lib/types";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    let sql = "SELECT * FROM login_logs";
    const params: any[] = [];

    if (username) {
      sql += " WHERE username = ?";
      params.push(username);
    }

    sql += " ORDER BY created_at DESC LIMIT 100";

    const rows = await query(sql, params);
    return NextResponse.json({ success: true, data: (rows || []) as LoginLog[] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let ids: string[] = [];

    try {
      const body = await request.json();
      if (body.ids && Array.isArray(body.ids)) {
        ids = body.ids;
      }
    } catch (e) {
      // Ignore if no body or invalid json
    }

    const userId = request.headers.get("x-auth-user-id");

    if (ids.length > 0) {
      await execute("DELETE FROM login_logs WHERE id IN (?)", [ids]);
      logActivity(userId, `Menghapus ${ids.length} riwayat login`, request.headers.get("x-auth-user-username"));
      return NextResponse.json({ success: true, message: "Riwayat login yang dipilih berhasil dihapus" });
    } else {
      await execute("DELETE FROM login_logs WHERE id IS NOT NULL");
      logActivity(userId, "Menghapus semua riwayat login", request.headers.get("x-auth-user-username"));
      return NextResponse.json({ success: true, message: "Semua riwayat login berhasil dihapus" });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
