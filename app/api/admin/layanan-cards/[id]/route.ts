import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/activity-log";
import { layananCardSchema } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/response";


export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rows = await db.select().from(schema.layanan_cards).where(eq(schema.layanan_cards.id, id));
    const row = rows[0];

    await db.delete(schema.layanan_cards).where(eq(schema.layanan_cards.id, id));

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus layanan: ${row?.nama_layanan || id}`, req.headers.get("x-auth-user-username"));
    return ok(row);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = layananCardSchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const updateObj: Record<string, unknown> = {};
    if (parsed.data.nama_layanan !== undefined) updateObj.nama_layanan = parsed.data.nama_layanan;
    if (parsed.data.deskripsi !== undefined) updateObj.deskripsi = parsed.data.deskripsi;
    if (parsed.data.url_google_form !== undefined) updateObj.url_google_form = parsed.data.url_google_form || null;
    if (parsed.data.cover_url !== undefined) updateObj.cover_url = parsed.data.cover_url || null;

    if (Object.keys(updateObj).length > 0) {
      await db.update(schema.layanan_cards).set(updateObj).where(eq(schema.layanan_cards.id, id));
    }

    const rows = await db.select().from(schema.layanan_cards).where(eq(schema.layanan_cards.id, id));
    const result = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Mengubah layanan: ${result?.nama_layanan || id}`, req.headers.get("x-auth-user-username"));
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
