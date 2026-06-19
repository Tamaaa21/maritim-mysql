import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { query, execute } from "@/lib/mysql";

export const runtime = "nodejs";

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;
    const body = await req.json();

    const updateData: any = {};
    if (body.name) {
      updateData.name = body.name;
      updateData.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.icon !== undefined) updateData.icon = body.icon;

    const setClauses = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(updateData);

    await execute(`UPDATE prakiraan_categories SET ${setClauses} WHERE id = ?`, [...values, id]);

    const [data] = await query("SELECT * FROM prakiraan_categories WHERE id = ?", [id]);

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Mengubah kategori prakiraan: ${data?.name || id}`,
      req.headers.get("x-auth-user-username")
    );
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;

    await execute("UPDATE prakiraan_images SET category_id = NULL WHERE category_id = ?", [id]);

    const [data] = await query("SELECT * FROM prakiraan_categories WHERE id = ?", [id]);

    await execute("DELETE FROM prakiraan_categories WHERE id = ?", [id]);

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menghapus kategori prakiraan: ${data?.name || id}`,
      req.headers.get("x-auth-user-username")
    );
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
