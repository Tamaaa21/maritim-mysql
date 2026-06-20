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
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const name = form.get("name")?.toString() || file?.name || `hero-${Date.now()}`;
    const orderIndex = form.get("order") ? parseInt(form.get("order")!.toString(), 10) : 0;

    if (!file) return badRequest("No file provided");

    const { url } = await uploadFile(file, "hero");

    const id = crypto.randomUUID();
    await db.insert(schema.hero_images).values({
      id,
      name,
      url,
      order_index: orderIndex,
    });

    const [data] = await db.select().from(schema.hero_images).where(eq(schema.hero_images.id, id));

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menambah hero slider: ${name}`,
      req.headers.get("x-auth-user-username")
    );

    return ok(data);
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
