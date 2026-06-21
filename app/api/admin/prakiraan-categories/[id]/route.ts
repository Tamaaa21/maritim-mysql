import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    const categorySchema = z.object({ name: z.string().optional(), description: z.string().optional(), icon: z.string().optional() });
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors.map(e => e.message).join(", ") }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name) {
      updateData.name = parsed.data.name;
      updateData.slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon;

    await db.update(schema.prakiraan_categories).set(updateData).where(eq(schema.prakiraan_categories.id, id));

    const [data] = await db.select().from(schema.prakiraan_categories).where(eq(schema.prakiraan_categories.id, id));

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Mengubah kategori prakiraan: ${data?.name || id}`,
      req.headers.get("x-auth-user-username")
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal mengubah kategori" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await db.update(schema.prakiraan_images).set({ category_id: null }).where(eq(schema.prakiraan_images.category_id, id));

    const [data] = await db.select().from(schema.prakiraan_categories).where(eq(schema.prakiraan_categories.id, id));

    await db.delete(schema.prakiraan_categories).where(eq(schema.prakiraan_categories.id, id));

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menghapus kategori prakiraan: ${data?.name || id}`,
      req.headers.get("x-auth-user-username")
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal menghapus kategori" }, { status: 500 });
  }
}
