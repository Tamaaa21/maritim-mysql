import crypto from "node:crypto";
import { query, execute } from "@/lib/mysql";
import { uploadFile, deleteFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import type { Publication } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query<any>(
      "SELECT * FROM publications ORDER BY created_at DESC"
    );
    return ok(rows as Publication[]);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const coverFile = form.get("coverFile") as File | null;
    const url = form.get("url")?.toString() || null;
    const coverUrl = form.get("coverUrl")?.toString() || null;
    const title = form.get("title")?.toString() || "";
    const description = form.get("description")?.toString() || "";
    const uploader = req.headers.get("x-auth-user-username") || form.get("uploader")?.toString() || null;

    let storedUrl = url;
    let filePath: string | null = null;
    if (file && file.size) {
      const result = await uploadFile(file, "publications");
      storedUrl = result.url;
      filePath = result.path;
    }

    let storedCoverUrl = coverUrl;
    if (coverFile && coverFile.size) {
      const result = await uploadFile(coverFile, "publications");
      storedCoverUrl = result.url;
    }

    if (!storedUrl) return badRequest("No file or url provided");

    const id = crypto.randomUUID();
    await execute(
      "INSERT INTO publications (id, title, description, url, cover_url, file_path, uploader) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, title, description, storedUrl, storedCoverUrl, filePath, uploader]
    );

    const rows = await query<any>(
      "SELECT * FROM publications WHERE id = ?",
      [id]
    );
    const data = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Menambah publikasi: ${title}`, req.headers.get("x-auth-user-username"));
    return ok(data as Publication);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequest("id required");

    const rows = await query<any>(
      "SELECT * FROM publications WHERE id = ?",
      [id]
    );
    const data = rows[0];
    if (!data) return notFound();

    if (data.file_path) {
      await deleteFile(data.file_path);
    }

    await execute("DELETE FROM publications WHERE id = ?", [id]);

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus publikasi: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as Publication);
  } catch (error) {
    return serverError(error);
  }
}
