import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/activity-log";
import { strukturOrganisasiSchema } from "@/lib/validation";
import { ok, badRequest, notFound, serverError } from "@/lib/response";


export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = strukturOrganisasiSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    await db.update(schema.struktur_organisasi).set({
      jabatan: parsed.data.jabatan,
      nama: parsed.data.nama || "",
      inisial: parsed.data.inisial || "",
      deskripsi: parsed.data.deskripsi || null,
      urutan: typeof parsed.data.urutan === "number" ? parsed.data.urutan : 0,
    }).where(eq(schema.struktur_organisasi.id, id));

    const rows = await db.select().from(schema.struktur_organisasi).where(eq(schema.struktur_organisasi.id, id));
    if (rows.length === 0) return notFound();
    const data = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Mengubah struktur organisasi: ${parsed.data.jabatan}`, req.headers.get("x-auth-user-username"));
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rows = await db.select().from(schema.struktur_organisasi).where(eq(schema.struktur_organisasi.id, id));
    const row = rows[0];
    if (!row) return notFound();

    await db.delete(schema.struktur_organisasi).where(eq(schema.struktur_organisasi.id, id));

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus struktur organisasi: ${row?.jabatan || id}`, req.headers.get("x-auth-user-username"));
    return ok(row);
  } catch (error) {
    return serverError(error);
  }
}
