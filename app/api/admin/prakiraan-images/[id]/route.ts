import { logActivity } from "@/lib/activity-log";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import { prakiraanSchema } from "@/lib/validation";

export const runtime = "nodejs";

const FIELD_MAP_PI: Record<string, string> = {
  title: "title",
  url: "url",
  explanation: "explanation",
  slug: "slug",
  waktu_mulai: "waktu_mulai",
  waktu_berakhir: "waktu_berakhir",
  next_url: "next_url",
  next_explanation: "next_explanation",
  next_waktu_mulai: "next_waktu_mulai",
  next_waktu_berakhir: "next_waktu_berakhir",
  display_type: "display_type",
  gallery_images: "gallery_images",
  category_id: "category_id",
  prioritas: "prioritas",
  is_active: "is_active",
  uploader: "uploader",
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const rows = await db.select()
      .from(schema.prakiraan_images)
      .leftJoin(schema.prakiraan_categories, eq(schema.prakiraan_images.category_id, schema.prakiraan_categories.id))
      .where(eq(schema.prakiraan_images.id, id));
    const raw = rows[0];

    if (!raw) return notFound();

    const data: any = { ...raw.prakiraan_images };
    if (data.gallery_images && typeof data.gallery_images === "string") {
      try { data.gallery_images = JSON.parse(data.gallery_images); } catch { /* ignore */ }
    }

    const cat = raw.prakiraan_categories;
    data.category = cat ? {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
    } : null;

    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const [data] = await db.select().from(schema.prakiraan_images).where(eq(schema.prakiraan_images.id, id));
    if (!data) return notFound();

    await db.delete(schema.prakiraan_images).where(eq(schema.prakiraan_images.id, id));

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menghapus prakiraan: ${data?.title || id}`,
      req.headers.get("x-auth-user-username")
    );
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const body = await req.json();
    const parsed = prakiraanSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const d = parsed.data as Record<string, unknown>;
    const cleanData: Record<string, unknown> = {};
    for (const key of Object.keys(FIELD_MAP_PI)) {
      if (d[key] !== undefined) cleanData[FIELD_MAP_PI[key]] = d[key];
    }

    if (Object.keys(cleanData).length === 0) {
      return badRequest("Tidak ada field yang valid untuk diupdate");
    }

    if (cleanData.gallery_images && Array.isArray(cleanData.gallery_images)) {
      cleanData.gallery_images = JSON.stringify(cleanData.gallery_images);
    }

    await db.update(schema.prakiraan_images).set(cleanData).where(eq(schema.prakiraan_images.id, id));

    const rows = await db.select()
      .from(schema.prakiraan_images)
      .leftJoin(schema.prakiraan_categories, eq(schema.prakiraan_images.category_id, schema.prakiraan_categories.id))
      .where(eq(schema.prakiraan_images.id, id));
    const raw = rows[0];

    if (!raw) return notFound();

    const data: any = { ...raw.prakiraan_images };
    if (data.gallery_images && typeof data.gallery_images === "string") {
      try { data.gallery_images = JSON.parse(data.gallery_images); } catch { /* ignore */ }
    }

    const cat = raw.prakiraan_categories;
    data.category = cat ? {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
    } : null;

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Mengubah prakiraan: ${data?.title || id}`,
      req.headers.get("x-auth-user-username")
    );
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}
