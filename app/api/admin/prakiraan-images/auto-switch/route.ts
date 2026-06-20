import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq, lt, and, isNotNull } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST() {
  try {
    const now = new Date();

    const expired = await db.select()
      .from(schema.prakiraan_images)
      .where(
        and(isNotNull(schema.prakiraan_images.next_url), lt(schema.prakiraan_images.waktu_berakhir, now))
      );

    const promoted: string[] = [];
    const archived: string[] = [];

    for (const item of expired || []) {
      await db.update(schema.prakiraan_images)
        .set({
          url: item.next_url!,
          explanation: item.next_explanation as string | null | undefined,
          waktu_mulai: item.next_waktu_mulai as any,
          waktu_berakhir: item.next_waktu_berakhir as any,
          next_url: null as any,
          next_explanation: null as any,
          next_waktu_mulai: null as any,
          next_waktu_berakhir: null as any,
        })
        .where(eq(schema.prakiraan_images.id, item.id));
      promoted.push(item.title || item.id);
    }

    return NextResponse.json({
      success: true,
      promoted,
      archived,
      message: `${promoted.length} konten diperbarui, ${archived.length} diarsipkan`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal auto-switch prakiraan" }, { status: 500 });
  }
}
