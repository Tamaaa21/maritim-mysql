import crypto from "crypto";
import { uploadFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { okCached, ok, badRequest, serverError } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let url = "";
    let name = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file") as File | null;
      name = form.get("name")?.toString() || file?.name || `hero-${Date.now()}`;
      const orderIndex = form.get("order") ? parseInt(form.get("order")!.toString(), 10) : 0;
      const externalUrl = form.get("url")?.toString() || "";

      if (file && file.size > 0) {
        const result = await uploadFile(file, "hero");
        url = result.url;
      } else if (externalUrl) {
        url = externalUrl;
      } else {
        return badRequest("No file or URL provided");
      }

      const id = crypto.randomUUID();
      await db.insert(schema.hero_images).values({ id, name, url, order_index: orderIndex });

      const [data] = await db.select().from(schema.hero_images).where(eq(schema.hero_images.id, id));
      logActivity(req.headers.get("x-auth-user-id"), `Menambah hero slider: ${name}`, req.headers.get("x-auth-user-username"));
      return ok(data);
    } else {
      const body = await req.json();
      url = body.url || "";
      name = body.name || `hero-${Date.now()}`;
      const orderIndex = body.order ?? 0;

      if (!url) return badRequest("URL harus diisi");

      const id = crypto.randomUUID();
      await db.insert(schema.hero_images).values({ id, name, url, order_index: orderIndex });

      const [data] = await db.select().from(schema.hero_images).where(eq(schema.hero_images.id, id));
      logActivity(req.headers.get("x-auth-user-id"), `Menambah hero slider: ${name}`, req.headers.get("x-auth-user-username"));
      return ok(data);
    }
  } catch (error) {
    return serverError(error);
  }
}

export async function GET() {
  try {
    const data = await db.select().from(schema.hero_images).orderBy(asc(schema.hero_images.order_index));
    return okCached(data);
  } catch (error) {
    return serverError(error);
  }
}
