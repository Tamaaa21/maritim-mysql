import crypto from "node:crypto";
import { db, schema } from "@/db";
import { eq, desc } from "drizzle-orm";
import { uploadFile, deleteFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, notFound, serverError } from "@/lib/response";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(schema.publications).orderBy(desc(schema.publications.created_at));
    return ok(rows);
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

    if (!title) return badRequest("Judul harus diisi");

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
    await db.insert(schema.publications).values({
      id,
      title,
      description,
      url: storedUrl,
      cover_url: storedCoverUrl,
      file_path: filePath,
      uploader,
    });

    const rows = await db.select().from(schema.publications).where(eq(schema.publications.id, id));
    const data = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Menambah publikasi: ${title}`, req.headers.get("x-auth-user-username"));
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequest("id required");

    const rows = await db.select().from(schema.publications).where(eq(schema.publications.id, id));
    const data = rows[0];
    if (!data) return notFound();

    if (data.file_path) {
      await deleteFile(data.file_path);
    }

    await db.delete(schema.publications).where(eq(schema.publications.id, id));

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus publikasi: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}
