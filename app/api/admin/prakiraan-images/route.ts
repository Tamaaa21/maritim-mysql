import crypto from "crypto";
import { uploadFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { db, schema } from "@/db";
import { eq, asc, and, gt, lte, or, isNull, sql } from "drizzle-orm";
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
      const insertValues: Record<string, unknown> = { id, title: parsed.data.title, url: parsed.data.url };

      if (parsed.data.explanation) insertValues.explanation = parsed.data.explanation;
      if (parsed.data.slug) insertValues.slug = parsed.data.slug;
      if (parsed.data.waktu_mulai) insertValues.waktu_mulai = parsed.data.waktu_mulai;
      if (parsed.data.waktu_berakhir) insertValues.waktu_berakhir = parsed.data.waktu_berakhir;
      if (parsed.data.category_id) insertValues.category_id = parsed.data.category_id;
      if (parsed.data.display_type && VALID_DISPLAY_TYPES.includes(parsed.data.display_type)) {
        insertValues.display_type = parsed.data.display_type;
      }
      if (parsed.data.next_url) insertValues.next_url = parsed.data.next_url;
      if (parsed.data.next_explanation) insertValues.next_explanation = parsed.data.next_explanation;
      if (parsed.data.next_waktu_mulai) insertValues.next_waktu_mulai = parsed.data.next_waktu_mulai;
      if (parsed.data.next_waktu_berakhir) insertValues.next_waktu_berakhir = parsed.data.next_waktu_berakhir;
      if (parsed.data.gallery_images) insertValues.gallery_images = JSON.stringify(parsed.data.gallery_images);
      if (parsed.data.prioritas !== undefined) insertValues.prioritas = parsed.data.prioritas;
      if (body.uploader) insertValues.uploader = body.uploader;

      await db.insert(schema.prakiraan_images).values(insertValues as any);

      const [data] = await db.select().from(schema.prakiraan_images).where(eq(schema.prakiraan_images.id, id));
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
    const insertValues: Record<string, unknown> = { id, title, url: publicUrl, slug };

    if (categoryId) insertValues.category_id = categoryId;
    if (explanation) insertValues.explanation = explanation;
    if (uploader) insertValues.uploader = uploader;
    if (waktuMulai) insertValues.waktu_mulai = waktuMulai;
    if (waktuBerakhir) insertValues.waktu_berakhir = waktuBerakhir;
    if (nextPublicUrl) insertValues.next_url = nextPublicUrl;
    if (nextExplanation) insertValues.next_explanation = nextExplanation;
    if (nextWaktuMulai) insertValues.next_waktu_mulai = nextWaktuMulai;
    if (nextWaktuBerakhir) insertValues.next_waktu_berakhir = nextWaktuBerakhir;
    if (displayType && VALID_DISPLAY_TYPES.includes(displayType)) {
      insertValues.display_type = displayType;
    }
    if (galleryImagesRaw) {
      try { insertValues.gallery_images = JSON.stringify(JSON.parse(galleryImagesRaw)); } catch { insertValues.gallery_images = galleryImagesRaw; }
    }
    if (prioritasRaw) insertValues.prioritas = parseInt(prioritasRaw, 10);

    await db.insert(schema.prakiraan_images).values(insertValues as any);

    const [data] = await db.select().from(schema.prakiraan_images).where(eq(schema.prakiraan_images.id, id));
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

    const now = new Date();

    const baseQuery = db.select()
      .from(schema.prakiraan_images)
      .leftJoin(schema.prakiraan_categories, eq(schema.prakiraan_images.category_id, schema.prakiraan_categories.id));

    let rows: any[];
    if (filterExpired || activeOnly) {
      rows = await baseQuery.where(
        and(
          or(isNull(schema.prakiraan_images.waktu_berakhir), gt(schema.prakiraan_images.waktu_berakhir, now)),
          or(isNull(schema.prakiraan_images.waktu_mulai), lte(schema.prakiraan_images.waktu_mulai, now)),
        )
      ).orderBy(asc(schema.prakiraan_images.created_at));
    } else {
      rows = await baseQuery.orderBy(asc(schema.prakiraan_images.created_at));
    }

    const data = (rows || []).map((row: any) => {
      const img = { ...row.prakiraan_images };
      if (img.gallery_images && typeof img.gallery_images === "string") {
        try { img.gallery_images = JSON.parse(img.gallery_images); } catch { /* ignore */ }
      }
      const cat = row.prakiraan_categories;
      img.category = cat ? {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      } : null;
      return img;
    });

    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}
