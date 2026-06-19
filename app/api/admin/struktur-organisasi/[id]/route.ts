import { query, execute } from "@/lib/mysql";
import { logActivity } from "@/lib/activity-log";
import { strukturOrganisasiSchema } from "@/lib/validation";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import type { StrukturOrganisasi } from "@/lib/types";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = strukturOrganisasiSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const result = await execute(
      "UPDATE struktur_organisasi SET jabatan = ?, nama = ?, inisial = ?, deskripsi = ?, urutan = ?, updated_at = NOW() WHERE id = ?",
      [
        parsed.data.jabatan,
        parsed.data.nama || "",
        parsed.data.inisial || null,
        parsed.data.deskripsi || null,
        typeof parsed.data.urutan === "number" ? parsed.data.urutan : 0,
        id,
      ]
    );

    if (result.affectedRows === 0) return notFound();

    const rows = await query<any>(
      "SELECT * FROM struktur_organisasi WHERE id = ?",
      [id]
    );
    const data = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Mengubah struktur organisasi: ${parsed.data.jabatan}`, req.headers.get("x-auth-user-username"));
    return ok(data as StrukturOrganisasi);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rows = await query<any>(
      "SELECT * FROM struktur_organisasi WHERE id = ?",
      [id]
    );
    const row = rows[0];
    if (!row) return notFound();

    await execute("DELETE FROM struktur_organisasi WHERE id = ?", [id]);

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus struktur organisasi: ${row?.jabatan || id}`, req.headers.get("x-auth-user-username"));
    return ok(row as StrukturOrganisasi);
  } catch (error) {
    return serverError(error);
  }
}
