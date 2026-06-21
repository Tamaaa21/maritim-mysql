import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { sql, lte, gte, and, or, isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    const [activeResult, inactiveResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(schema.prakiraan_images)
        .where(
          and(
            lte(schema.prakiraan_images.waktu_mulai, now),
            or(gte(schema.prakiraan_images.waktu_berakhir, now), isNull(schema.prakiraan_images.waktu_berakhir))
          )
        ),
      db.select({ count: sql<number>`count(*)` })
        .from(schema.prakiraan_images)
        .where(lte(schema.prakiraan_images.waktu_berakhir, now)),
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
