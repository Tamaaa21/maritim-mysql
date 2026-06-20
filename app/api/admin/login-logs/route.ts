import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, desc, and } from "drizzle-orm";

import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    const rows = username
      ? await db.select().from(schema.login_logs).where(eq(schema.login_logs.username, username)).orderBy(desc(schema.login_logs.created_at)).limit(100)
      : await db.select().from(schema.login_logs).orderBy(desc(schema.login_logs.created_at)).limit(100);
    return NextResponse.json({ success: true, data: rows || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data log" }, { status: 500 });
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
      for (const id of ids) {
        await db.delete(schema.login_logs).where(eq(schema.login_logs.id, id));
      }
      logActivity(userId, `Menghapus ${ids.length} riwayat login`, request.headers.get("x-auth-user-username"));
      return NextResponse.json({ success: true, message: "Riwayat login yang dipilih berhasil dihapus" });
    } else {
      await db.delete(schema.login_logs);
      logActivity(userId, "Menghapus semua riwayat login", request.headers.get("x-auth-user-username"));
      return NextResponse.json({ success: true, message: "Semua riwayat login berhasil dihapus" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal menghapus riwayat login" }, { status: 500 });
  }
}
