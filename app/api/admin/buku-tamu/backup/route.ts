import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query("SELECT * FROM buku_tamu ORDER BY created_at ASC");

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
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
