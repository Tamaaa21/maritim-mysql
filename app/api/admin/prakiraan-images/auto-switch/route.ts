import { NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql";

export const runtime = "nodejs";

export async function POST() {
  try {
    const now = new Date().toISOString();

    const expired = await query(
      "SELECT * FROM prakiraan_images WHERE next_url IS NOT NULL AND waktu_berakhir < ?",
      [now]
    );

    const promoted: string[] = [];
    const archived: string[] = [];

    for (const item of expired || []) {
      await execute(
        `UPDATE prakiraan_images SET url = ?, explanation = ?, waktu_mulai = ?, waktu_berakhir = ?, next_url = NULL, next_explanation = NULL, next_waktu_mulai = NULL, next_waktu_berakhir = NULL WHERE id = ?`,
        [item.next_url, item.next_explanation, item.next_waktu_mulai, item.next_waktu_berakhir, item.id]
      );
      promoted.push(item.title || item.id);
    }

    return NextResponse.json({
      success: true,
      promoted,
      archived,
      message: `${promoted.length} konten diperbarui, ${archived.length} diarsipkan`,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
