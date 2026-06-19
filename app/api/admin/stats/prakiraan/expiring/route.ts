import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const nowISO = now.toISOString();

    const rows = await query(
      "SELECT id, title, slug, waktu_mulai, waktu_berakhir FROM prakiraan_images WHERE waktu_mulai <= ? AND waktu_berakhir >= ? AND waktu_berakhir <= ? ORDER BY waktu_berakhir ASC",
      [nowISO, nowISO, twentyFourHoursLater]
    );

    return NextResponse.json({ success: true, data: rows ?? [] });
  } catch (error: any) {
    console.error("Error fetching expiring prakiraan:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
