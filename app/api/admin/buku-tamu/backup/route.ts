import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { asc } from "drizzle-orm";
import { isAdmin } from "@/services/admin.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const rows = await db.select().from(schema.buku_tamu).orderBy(asc(schema.buku_tamu.created_at));

    const backupData = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      total: rows.length,
      records: rows,
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="buku_tamu_backup_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal mengambil backup" }, { status: 500 });
  }
}
