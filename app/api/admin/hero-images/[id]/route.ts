import { logActivity } from "@/lib/activity-log";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { ok, badRequest, serverError } from "@/lib/response";
import { heroImageSchema } from "@/lib/validation";

export const runtime = "nodejs";

const FIELD_MAP: Record<string, keyof typeof schema.hero_images> = {
  name: "name",
  url: "url",
  order_index: "order_index",
  is_active: "is_active",
};

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const [data] = await db.select().from(schema.hero_images).where(eq(schema.hero_images.id, id));
    if (!data) return badRequest("Data tidak ditemukan");

    await db.delete(schema.hero_images).where(eq(schema.hero_images.id, id));

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menghapus hero slider: ${data?.name || id}`,
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
    const parsed = heroImageSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const d = parsed.data as Record<string, unknown>;
    const cleanData: Record<string, unknown> = {};
    for (const key of Object.keys(FIELD_MAP)) {
      if (d[key] !== undefined) cleanData[FIELD_MAP[key]] = d[key];
    }

    if (Object.keys(cleanData).length === 0) {
      return badRequest("Tidak ada field yang valid untuk diupdate");
    }

    await db.update(schema.hero_images).set(cleanData).where(eq(schema.hero_images.id, id));

    const [data] = await db.select().from(schema.hero_images).where(eq(schema.hero_images.id, id));

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Mengubah hero slider: ${data?.name || id}`,
      req.headers.get("x-auth-user-username")
    );
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}
