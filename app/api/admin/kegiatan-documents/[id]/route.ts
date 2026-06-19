import crypto from "node:crypto";
import { query, execute } from "@/lib/mysql";
import { uploadMultipleFiles, deleteFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { ok, serverError } from "@/lib/response";
import type { KegiatanDocument } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rows = await query<any>(
      "SELECT * FROM kegiatan_documents WHERE id = ?",
      [id]
    );
    const row = rows[0];

    if (row?.file_path) {
      await deleteFile(row.file_path);
    }

    await execute("DELETE FROM kegiatan_documents WHERE id = ?", [id]);

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus dokumentasi kegiatan: ${row?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(row as KegiatanDocument);
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
    }

    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of Object.entries(body)) {
      setClauses.push(`${key} = ?`);
      values.push(value);
    }
    setClauses.push("updated_at = NOW()");
    values.push(id);

    await execute(
      `UPDATE kegiatan_documents SET ${setClauses.join(", ")} WHERE id = ?`,
      values
    );

    const rows = await query<any>(
      "SELECT * FROM kegiatan_documents WHERE id = ?",
      [id]
    );
    const result = rows[0];
    if (result?.image_urls && typeof result.image_urls === "string") {
      try { result.image_urls = JSON.parse(result.image_urls); } catch {}
    }

    logActivity(req.headers.get("x-auth-user-id"), `Mengubah dokumentasi kegiatan: ${result?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(result as KegiatanDocument);
  } catch (error) {
    return serverError(error);
  }
}
