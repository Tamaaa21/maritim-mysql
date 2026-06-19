import { uploadFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { query, execute } from "@/lib/mysql";
import { prakiraanSchema } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_DISPLAY_TYPES = ["gambar_saja", "gambar_teks", "gambar_galeri"];

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const parsed = prakiraanSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.errors.map(e => e.message).join(", "));
      }

      if (!parsed.data.url) return badRequest("No url provided");

      const id = crypto.randomUUID();
      const fields: string[] = ["id", "title", "url"];
      const values: unknown[] = [id, parsed.data.title, parsed.data.url];
      const placeholders: string[] = ["?", "?", "?"];

      if (parsed.data.explanation) { fields.push("explanation"); values.push(parsed.data.explanation); placeholders.push("?"); }
      if (parsed.data.slug) { fields.push("slug"); values.push(parsed.data.slug); placeholders.push("?"); }
      if (parsed.data.waktu_mulai) { fields.push("waktu_mulai"); values.push(parsed.data.waktu_mulai); placeholders.push("?"); }
      if (parsed.data.waktu_berakhir) { fields.push("waktu_berakhir"); values.push(parsed.data.waktu_berakhir); placeholders.push("?"); }
      if (parsed.data.category_id) { fields.push("category_id"); values.push(parsed.data.category_id); placeholders.push("?"); }
      if (parsed.data.display_type && VALID_DISPLAY_TYPES.includes(parsed.data.display_type)) {
        fields.push("display_type"); values.push(parsed.data.display_type); placeholders.push("?");
      }
      if (parsed.data.next_url) { fields.push("next_url"); values.push(parsed.data.next_url); placeholders.push("?"); }
      if (parsed.data.next_explanation) { fields.push("next_explanation"); values.push(parsed.data.next_explanation); placeholders.push("?"); }
      if (parsed.data.next_waktu_mulai) { fields.push("next_waktu_mulai"); values.push(parsed.data.next_waktu_mulai); placeholders.push("?"); }
      if (parsed.data.next_waktu_berakhir) { fields.push("next_waktu_berakhir"); values.push(parsed.data.next_waktu_berakhir); placeholders.push("?"); }
      if (parsed.data.gallery_images) { fields.push("gallery_images"); values.push(JSON.stringify(parsed.data.gallery_images)); placeholders.push("?"); }
      if (parsed.data.prioritas !== undefined) { fields.push("prioritas"); values.push(parsed.data.prioritas); placeholders.push("?"); }
      if (body.uploader) { fields.push("uploader"); values.push(body.uploader); placeholders.push("?"); }

      await execute(
        `INSERT INTO prakiraan_images (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`,
        values
      );

      const [data] = await query("SELECT * FROM prakiraan_images WHERE id = ?", [id]);
      if (data?.gallery_images && typeof data.gallery_images === "string") {
        try { data.gallery_images = JSON.parse(data.gallery_images); } catch { /* ignore */ }
      }

      logActivity(
        req.headers.get("x-auth-user-id"),
        `Menambah prakiraan: ${parsed.data.title}`,
        req.headers.get("x-auth-user-username")
      );
      return ok(data);
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const nextFile = form.get("nextFile") as File | null;
    const title = form.get("title")?.toString() || file?.name || `prakiraan-${Date.now()}`;
    const explanation = form.get("explanation")?.toString() || null;
    const uploader = form.get("uploader")?.toString() || null;
    const waktuMulai = form.get("waktu_mulai")?.toString() || form.get("waktuMulai")?.toString() || null;
    const waktuBerakhir = form.get("waktu_berakhir")?.toString() || form.get("waktuBerakhir")?.toString() || null;
    const nextExplanation = form.get("next_explanation")?.toString() || null;
    const nextWaktuMulai = form.get("next_waktu_mulai")?.toString() || null;
    const nextWaktuBerakhir = form.get("next_waktu_berakhir")?.toString() || null;
    const displayType = form.get("display_type")?.toString() || null;
    const galleryImagesRaw = form.get("gallery_images")?.toString() || null;
    const prioritasRaw = form.get("prioritas")?.toString() || null;
    const slug = form.get("slug")?.toString() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const categoryId = form.get("category_id")?.toString() || null;

    if (!file) return badRequest("No file provided");

    const { url: publicUrl } = await uploadFile(file, "prakiraan");

    let nextPublicUrl: string | null = null;
    if (nextFile) {
      const result = await uploadFile(nextFile, "prakiraan");
      nextPublicUrl = result.url;
    }

    const id = crypto.randomUUID();
    const fields: string[] = ["id", "title", "url", "slug"];
    const values: unknown[] = [id, title, publicUrl, slug];
    const placeholders: string[] = ["?", "?", "?", "?"];

    if (categoryId) { fields.push("category_id"); values.push(categoryId); placeholders.push("?"); }
    if (explanation) { fields.push("explanation"); values.push(explanation); placeholders.push("?"); }
    if (uploader) { fields.push("uploader"); values.push(uploader); placeholders.push("?"); }
    if (waktuMulai) { fields.push("waktu_mulai"); values.push(waktuMulai); placeholders.push("?"); }
    if (waktuBerakhir) { fields.push("waktu_berakhir"); values.push(waktuBerakhir); placeholders.push("?"); }
    if (nextPublicUrl) { fields.push("next_url"); values.push(nextPublicUrl); placeholders.push("?"); }
    if (nextExplanation) { fields.push("next_explanation"); values.push(nextExplanation); placeholders.push("?"); }
    if (nextWaktuMulai) { fields.push("next_waktu_mulai"); values.push(nextWaktuMulai); placeholders.push("?"); }
    if (nextWaktuBerakhir) { fields.push("next_waktu_berakhir"); values.push(nextWaktuBerakhir); placeholders.push("?"); }
    if (displayType && VALID_DISPLAY_TYPES.includes(displayType)) {
      fields.push("display_type"); values.push(displayType); placeholders.push("?");
    }
    if (galleryImagesRaw) {
      fields.push("gallery_images");
      try { values.push(JSON.stringify(JSON.parse(galleryImagesRaw))); } catch { values.push(galleryImagesRaw); }
      placeholders.push("?");
    }
    if (prioritasRaw) { fields.push("prioritas"); values.push(parseInt(prioritasRaw, 10)); placeholders.push("?"); }

    await execute(
      `INSERT INTO prakiraan_images (${fields.join(", ")}) VALUES (${placeholders.join(", ")})`,
      values
    );

    const [data] = await query("SELECT * FROM prakiraan_images WHERE id = ?", [id]);
    if (data?.gallery_images && typeof data.gallery_images === "string") {
      try { data.gallery_images = JSON.parse(data.gallery_images); } catch { /* ignore */ }
    }

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menambah prakiraan: ${title}`,
      req.headers.get("x-auth-user-username")
    );
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterExpired = searchParams.get("filterExpired") === "true";
    const activeOnly = searchParams.get("activeOnly") === "true";

    let sql = `SELECT p.*, c.name AS cat_name, c.slug AS cat_slug, c.description AS cat_description, c.icon AS cat_icon FROM prakiraan_images p LEFT JOIN prakiraan_categories c ON p.category_id = c.id`;
    const conditions: string[] = [];
    const params: unknown[] = [];

    const nowStr = new Date().toISOString();

    if (filterExpired || activeOnly) {
      conditions.push("(p.waktu_berakhir IS NULL OR p.waktu_berakhir > ?)");
      params.push(nowStr);
      conditions.push("(p.waktu_mulai IS NULL OR p.waktu_mulai <= ?)");
      params.push(nowStr);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY p.created_at ASC";

    const rows = await query(sql, params);

    const data = (rows || []).map((row: any) => {
      if (row.gallery_images && typeof row.gallery_images === "string") {
        try { row.gallery_images = JSON.parse(row.gallery_images); } catch { /* ignore */ }
      }
      row.category = row.cat_name ? {
        id: row.category_id,
        name: row.cat_name,
        slug: row.cat_slug,
        description: row.cat_description,
        icon: row.cat_icon,
      } : null;
      delete row.cat_name; delete row.cat_slug; delete row.cat_description; delete row.cat_icon;
      return row;
    });

    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}
