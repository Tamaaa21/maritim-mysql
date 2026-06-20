import crypto from "node:crypto";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { uploadMultipleFiles } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { ok, okCached, badRequest, serverError } from "@/lib/response";


const FIELD_MAP_KD_CREATE: Record<string, string> = {
  id: "id",
  title: "title",
  description: "description",
  url: "url",
  file_path: "file_path",
  file_type: "file_type",
  event_date: "event_date",
  image_urls: "image_urls",
  youtube_url: "youtube_url",
  category: "category",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const singleFile = form.get("file") as File | null;
    const title = form.get("title")?.toString() || singleFile?.name || `kegiatan-${Date.now()}`;
    const description = form.get("description")?.toString() || null;
    const event_date = form.get("event_date")?.toString() || null;
    const youtube_url = form.get("youtube_url")?.toString() || null;

    const allFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);
    if (allFiles.length === 0 && !youtube_url) {
      return badRequest("No file or YouTube link provided");
    }

    const id = crypto.randomUUID();
    const insertData: Record<string, unknown> = { id, title };

    if (allFiles.length > 0) {
      const uploaded = await uploadMultipleFiles(allFiles, "kegiatan");
      const imageUrls = uploaded.map(u => u.url);
      const firstFile = uploaded[0];
      insertData.url = firstFile.url;
      insertData.file_path = firstFile.path;
      insertData.file_type = allFiles[0].type;
      insertData.image_urls = JSON.stringify(imageUrls);
    } else if (youtube_url) {
      const ytId = getYouTubeId(youtube_url);
      if (ytId) insertData.url = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    if (description) insertData.description = description;
    if (event_date) insertData.event_date = event_date;
    if (youtube_url) insertData.youtube_url = youtube_url;

    const values: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(insertData)) {
      const schemaKey = FIELD_MAP_KD_CREATE[key];
      if (schemaKey) values[schemaKey] = value;
    }
    await db.insert(schema.kegiatan_documents).values(values as any);

    const rows = await db.select().from(schema.kegiatan_documents).where(eq(schema.kegiatan_documents.id, id));
    const result = rows[0];
    if (result?.image_urls && typeof result.image_urls === "string") {
      try { result.image_urls = JSON.parse(result.image_urls); } catch {}
    }

    logActivity(req.headers.get("x-auth-user-id"), `Menambah dokumentasi kegiatan: ${title}`, req.headers.get("x-auth-user-username"));
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

export async function GET() {
  try {
    const rows = await db.select().from(schema.kegiatan_documents).orderBy(desc(schema.kegiatan_documents.created_at));
    const data = rows.map((r: any) => {
      if (r.image_urls && typeof r.image_urls === "string") {
        try { r.image_urls = JSON.parse(r.image_urls); } catch {}
      }
      return r;
    });
    return okCached(data);
  } catch (error) {
    return serverError(error);
  }
}
