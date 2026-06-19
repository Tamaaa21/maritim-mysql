import { query, execute } from "@/lib/mysql";
import { logActivity } from "@/lib/activity-log";
import { layananCardSchema } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/response";
import type { LayananCard } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rows = await query<any>(
      "SELECT * FROM layanan_cards WHERE id = ?",
      [id]
    );
    const row = rows[0];

    await execute("DELETE FROM layanan_cards WHERE id = ?", [id]);

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus layanan: ${row?.nama_layanan || id}`, req.headers.get("x-auth-user-username"));
    return ok(row as LayananCard);
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

    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(updateObj)) {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
    setClauses.push("updated_at = NOW()");
    values.push(id);

    await execute(
      `UPDATE layanan_cards SET ${setClauses.join(", ")} WHERE id = ?`,
      values
    );

    const rows = await query<any>(
      "SELECT * FROM layanan_cards WHERE id = ?",
      [id]
    );
    const result = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Mengubah layanan: ${result?.nama_layanan || id}`, req.headers.get("x-auth-user-username"));
    return ok(result as LayananCard);
  } catch (error) {
    return serverError(error);
  }
}
