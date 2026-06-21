import crypto from "node:crypto";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { uploadMultipleFiles, deleteFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, serverError } from "@/lib/response";
import { kegiatanDocumentSchema } from "@/lib/validation";


const FIELD_MAP_KD: Record<string, string> = {
  title: "title",
  description: "description",
  event_date: "event_date",
  youtube_url: "youtube_url",
  url: "url",
  file_path: "file_path",
  file_type: "file_type",
  image_urls: "image_urls",
  category: "category",
};

export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rows = await db.select().from(schema.kegiatan_documents).where(eq(schema.kegiatan_documents.id, id));
    const row = rows[0];

    let urls: string[] = [];
    if (row?.image_urls) {
      if (typeof row.image_urls === "string") {
        try {
          const parsed = JSON.parse(row.image_urls);
          if (Array.isArray(parsed)) urls = parsed;
          else if (typeof parsed === "string") try { urls = JSON.parse(parsed); } catch {}
        } catch {}
      } else if (Array.isArray(row.image_urls)) {
        urls = row.image_urls;
      }
    }
    urls = urls.filter(u => typeof u === "string" && u.startsWith("/uploads/"));

    if (urls.length > 0) {
      for (const url of urls) {
        const relativePath = url.replace(/^\/uploads\//, "");
        try { await deleteFile(relativePath); } catch (e) { console.error(`Failed to delete ${relativePath}:`, e); }
      }
    } else if (row?.file_path) {
      await deleteFile(row.file_path);
    }

    await db.delete(schema.kegiatan_documents).where(eq(schema.kegiatan_documents.id, id));

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus dokumentasi kegiatan: ${row?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(row);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await db.select().from(schema.kegiatan_documents).where(eq(schema.kegiatan_documents.id, id));
    const existingRow = existing[0];
    if (!existingRow) return badRequest("Document not found");

    let body: Record<string, unknown> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form.getAll("files") as File[];
      const description = form.get("description");
      const event_date = form.get("event_date");
      const title = form.get("title");
      const youtube_url = form.get("youtube_url");
      const removedUrlsRaw = form.get("removed_urls");

      if (title) body.title = title.toString();
      if (description) body.description = description.toString();
      if (event_date) body.event_date = event_date.toString();
      if (youtube_url !== null) body.youtube_url = youtube_url?.toString() || null;

      let existingUrls: string[] = [];
      if (existingRow.image_urls) {
        if (Array.isArray(existingRow.image_urls)) {
          existingUrls = existingRow.image_urls;
        } else if (typeof existingRow.image_urls === "string") {
          try {
            const parsed = JSON.parse(existingRow.image_urls);
            if (Array.isArray(parsed)) {
              existingUrls = parsed;
            } else if (typeof parsed === "string") {
              try { existingUrls = JSON.parse(parsed); } catch {}
            }
          } catch {}
        }
      }
      existingUrls = existingUrls.filter(u => typeof u === "string" && (u.startsWith("/uploads/") || u.startsWith("http")));
      if (existingUrls.length === 0 && existingRow.url && !existingRow.youtube_url) {
        existingUrls = [existingRow.url];
      }

      if (removedUrlsRaw) {
        try {
          const removed: string[] = JSON.parse(removedUrlsRaw.toString());
          for (const url of removed) {
            const relativePath = url.replace(/^\/uploads\//, "");
            await deleteFile(relativePath);
          }
          existingUrls = existingUrls.filter(u => !removed.includes(u));
        } catch {}
      }

      if (files.length > 0) {
        const uploaded = await uploadMultipleFiles(files, "kegiatan");
        const newUrls = uploaded.map(u => u.url);
        existingUrls = [...existingUrls, ...newUrls];

        body.url = newUrls[0];
        body.file_path = uploaded[0].path;
        body.file_type = files[0].type;
      }

      if (!body.url && existingUrls.length > 0) {
        body.url = existingUrls[0];
      }

      body.image_urls = existingUrls;
    } else {
      body = await req.json();
      const parsed = kegiatanDocumentSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.errors.map(e => e.message).join(", "));
      }
      body = parsed.data as Record<string, unknown>;
    }

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      const schemaKey = FIELD_MAP_KD[key];
      if (schemaKey) updateData[schemaKey] = value;
    }
    if (Object.keys(updateData).length > 0) {
      await db.update(schema.kegiatan_documents).set(updateData).where(eq(schema.kegiatan_documents.id, id));
    }

    const rows = await db.select().from(schema.kegiatan_documents).where(eq(schema.kegiatan_documents.id, id));
    const result = rows[0];
    if (result?.image_urls) {
      if (typeof result.image_urls === "string") {
        try {
          const parsed = JSON.parse(result.image_urls);
          if (Array.isArray(parsed)) {
            result.image_urls = parsed;
          } else if (typeof parsed === "string") {
            try { result.image_urls = JSON.parse(parsed); } catch { result.image_urls = []; }
          } else {
            result.image_urls = [];
          }
        } catch { result.image_urls = []; }
      } else if (!Array.isArray(result.image_urls)) {
        result.image_urls = [];
      }
    }

    logActivity(req.headers.get("x-auth-user-id"), `Mengubah dokumentasi kegiatan: ${result?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
