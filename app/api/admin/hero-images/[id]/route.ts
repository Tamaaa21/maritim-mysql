import { logActivity } from "@/lib/activity-log";
import { query, execute } from "@/lib/mysql";
import { ok, badRequest, serverError } from "@/lib/response";

export const runtime = "nodejs";

const ALLOWED_FIELDS = ["name", "url", "order_index", "is_active"];

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const [data] = await query("SELECT * FROM hero_images WHERE id = ?", [id]);
    if (!data) return badRequest("Data tidak ditemukan");

    await execute("DELETE FROM hero_images WHERE id = ?", [id]);

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

    const cleanData: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) cleanData[key] = body[key];
    }

    if (Object.keys(cleanData).length === 0) {
      return badRequest("Tidak ada field yang valid untuk diupdate");
    }

    const setClauses = Object.keys(cleanData).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(cleanData);

    await execute(`UPDATE hero_images SET ${setClauses} WHERE id = ?`, [...values, id]);

    const [data] = await query("SELECT * FROM hero_images WHERE id = ?", [id]);

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
