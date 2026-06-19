import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const slug = params?.slug;
    if (!slug) return NextResponse.json({ success: false, message: "Slug required" }, { status: 400 });

    const rows = await query<any>(
      `SELECT p.*,
        c.id AS category_id_val,
        c.name AS category_name,
        c.slug AS category_slug,
        c.description AS category_description,
        c.icon AS category_icon
      FROM prakiraan_images p
      LEFT JOIN prakiraan_categories c ON c.id = p.category_id
      WHERE p.slug = ?
      LIMIT 1`,
      [slug]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    const row = rows[0];
    const { category_id_val, category_name, category_slug, category_description, category_icon, ...rest } = row;
    const data = {
      ...rest,
      category: category_id_val ? {
        id: category_id_val,
        name: category_name,
        slug: category_slug,
        description: category_description,
        icon: category_icon,
      } : null,
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
