import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { sql, and, or, isNull, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    const [activeResult, inactiveResult] = await Promise.all([
      // Active: is_active = true AND (waktu_mulai IS NULL OR waktu_mulai <= now) AND (waktu_berakhir IS NULL OR waktu_berakhir >= now)
      db.select({ count: sql<number>`count(*)` })
        .from(schema.prakiraan_images)
        .where(
          and(
            eq(schema.prakiraan_images.is_active, true),
            or(
              isNull(schema.prakiraan_images.waktu_mulai),
              sql`${schema.prakiraan_images.waktu_mulai} <= ${now}`
            ),
            or(
              isNull(schema.prakiraan_images.waktu_berakhir),
              sql`${schema.prakiraan_images.waktu_berakhir} >= ${now}`
            )
          )
        ),
      // Inactive: is_active = false OR waktu_berakhir < now OR (waktu_mulai > now AND waktu_mulai IS NOT NULL)
      db.select({ count: sql<number>`count(*)` })
        .from(schema.prakiraan_images)
        .where(
          or(
            eq(schema.prakiraan_images.is_active, false),
            sql`${schema.prakiraan_images.waktu_berakhir} IS NOT NULL AND ${schema.prakiraan_images.waktu_berakhir} < ${now}`,
            sql`${schema.prakiraan_images.waktu_mulai} IS NOT NULL AND ${schema.prakiraan_images.waktu_mulai} > ${now}`
          )
        ),
    ]);

    return NextResponse.json({
      success: true,
      active: activeResult[0]?.count ?? 0,
      inactive: inactiveResult[0]?.count ?? 0,
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ success: false, active: 0, inactive: 0 }, { status: 500 });
  }
}
