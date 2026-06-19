import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date().toISOString();

    const [activeRows, inactiveRows] = await Promise.all([
      query(
        "SELECT COUNT(*) as count FROM prakiraan_images WHERE waktu_mulai <= ? AND (waktu_berakhir >= ? OR waktu_berakhir IS NULL)",
        [now, now]
      ),
      query("SELECT COUNT(*) as count FROM prakiraan_images WHERE waktu_berakhir < ?", [now]),
    ]);

    return NextResponse.json({
      success: true,
      active: activeRows[0]?.count ?? 0,
      inactive: inactiveRows[0]?.count ?? 0,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, active: 0, inactive: 0 }, { status: 500 });
  }
}
