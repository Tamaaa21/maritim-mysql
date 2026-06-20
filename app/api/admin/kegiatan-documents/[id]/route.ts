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

    if (row?.file_path) {
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

    let body: Record<string, unknown> = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form.getAll("files") as File[];
      const description = form.get("description");
      const event_date = form.get("event_date");
      const title = form.get("title");
      const youtube_url = form.get("youtube_url");

      if (title) body.title = title.toString();
      if (description) body.description = description.toString();
      if (event_date) body.event_date = event_date.toString();
      if (youtube_url !== null) body.youtube_url = youtube_url?.toString() || null;

      if (files.length > 0) {
        const uploaded = await uploadMultipleFiles(files, "kegiatan");
        const imageUrls = uploaded.map(u => u.url);
        const firstFile = uploaded[0];
        body.url = firstFile.url;
        body.file_path = firstFile.path;
        body.file_type = files[0].type;
        body.image_urls = JSON.stringify(imageUrls);
      }
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
    if (result?.image_urls && typeof result.image_urls === "string") {
      try { result.image_urls = JSON.parse(result.image_urls); } catch {}
    }

    logActivity(req.headers.get("x-auth-user-id"), `Mengubah dokumentasi kegiatan: ${result?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
