import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    if (!slug) return NextResponse.json({ success: false, message: "Slug required" }, { status: 400 });

    const rows = await db.select()
      .from(schema.prakiraan_images)
      .leftJoin(schema.prakiraan_categories, eq(schema.prakiraan_images.category_id, schema.prakiraan_categories.id))
      .where(eq(schema.prakiraan_images.slug, slug))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const raw = rows[0];
    const img = raw.prakiraan_images;
    const cat = raw.prakiraan_categories;
    const data = {
      ...img,
      category: cat ? {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      } : null,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data prakiraan" }, { status: 500 });
  }
}
