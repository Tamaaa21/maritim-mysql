import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";
import type { LoginLog } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query("SELECT * FROM login_logs ORDER BY created_at ASC");

    const backupData = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      total: rows.length,
      records: rows as LoginLog[],
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="login_logs_backup_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
