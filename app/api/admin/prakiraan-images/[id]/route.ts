import { logActivity } from "@/lib/activity-log";
import { query, execute } from "@/lib/mysql";
import { ok, badRequest, notFound, serverError } from "@/lib/response";

export const runtime = "nodejs";

const ALLOWED_FIELDS = [
  "title", "url", "explanation", "slug",
  "waktu_mulai", "waktu_berakhir",
  "next_url", "next_explanation", "next_waktu_mulai", "next_waktu_berakhir",
  "display_type", "gallery_images", "category_id", "prioritas", "is_active",
  "uploader",
];

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const sql = `SELECT p.*, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description, c.icon AS cat_icon FROM prakiraan_images p LEFT JOIN prakiraan_categories c ON p.category_id = c.id WHERE p.id = ?`;
    const rows = await query(sql, [id]);
    const data = rows[0];

    if (!data) return notFound();

    if (data.gallery_images && typeof data.gallery_images === "string") {
      try { data.gallery_images = JSON.parse(data.gallery_images); } catch { /* ignore */ }
    }

    data.category = data.cat_name ? {
      id: data.category_id,
      name: data.cat_name,
      slug: data.cat_slug,
      description: data.cat_description,
      icon: data.cat_icon,
    } : null;
    delete data.cat_name; delete data.cat_slug; delete data.cat_description; delete data.cat_icon;

    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) return badRequest("Invalid id");

    const [data] = await query("SELECT * FROM prakiraan_images WHERE id = ?", [id]);
    if (!data) return notFound();

    await execute("DELETE FROM prakiraan_images WHERE id = ?", [id]);

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

    const cleanData: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) cleanData[key] = body[key];
    }

    if (Object.keys(cleanData).length === 0) {
      return badRequest("Tidak ada field yang valid untuk diupdate");
    }

    if (cleanData.gallery_images && Array.isArray(cleanData.gallery_images)) {
      cleanData.gallery_images = JSON.stringify(cleanData.gallery_images);
    }

    const setClauses = Object.keys(cleanData).map((key) => `${key} = ?`).join(", ");
    const values = Object.values(cleanData);

    await execute(`UPDATE prakiraan_images SET ${setClauses} WHERE id = ?`, [...values, id]);

    const sql = `SELECT p.*, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description, c.icon AS cat_icon FROM prakiraan_images p LEFT JOIN prakiraan_categories c ON p.category_id = c.id WHERE p.id = ?`;
    const rows = await query(sql, [id]);
    const data = rows[0];

    if (!data) return notFound();

    if (data.gallery_images && typeof data.gallery_images === "string") {
      try { data.gallery_images = JSON.parse(data.gallery_images); } catch { /* ignore */ }
    }

    data.category = data.cat_name ? {
      id: data.category_id,
      name: data.cat_name,
      slug: data.cat_slug,
      description: data.cat_description,
      icon: data.cat_icon,
    } : null;
    delete data.cat_name; delete data.cat_slug; delete data.cat_description; delete data.cat_icon;

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
