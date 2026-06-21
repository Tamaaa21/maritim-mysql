import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { and, lte, gte, asc } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const rows = await db.select({
      id: schema.prakiraan_images.id,
      title: schema.prakiraan_images.title,
      slug: schema.prakiraan_images.slug,
      waktu_mulai: schema.prakiraan_images.waktu_mulai,
      waktu_berakhir: schema.prakiraan_images.waktu_berakhir,
    })
      .from(schema.prakiraan_images)
      .where(
        and(
          lte(schema.prakiraan_images.waktu_mulai, now),
          gte(schema.prakiraan_images.waktu_berakhir, now),
          lte(schema.prakiraan_images.waktu_berakhir, twentyFourHoursLater),
        )
      )
      .orderBy(asc(schema.prakiraan_images.waktu_berakhir));

    return NextResponse.json({ success: true, data: rows ?? [] });
  } catch (error: unknown) {
    console.error("Error fetching expiring prakiraan:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
