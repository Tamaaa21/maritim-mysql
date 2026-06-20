import crypto from "node:crypto";
import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { logActivity } from "@/lib/activity-log";
import { layananCardSchema } from "@/lib/validation";
import { okCached, ok, badRequest, serverError } from "@/lib/response";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(schema.layanan_cards).orderBy(asc(schema.layanan_cards.created_at));
    return okCached(rows);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = layananCardSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const id = crypto.randomUUID();
    await db.insert(schema.layanan_cards).values({
      id,
      nama_layanan: parsed.data.nama_layanan,
      deskripsi: parsed.data.deskripsi || null,
      url_google_form: parsed.data.url_google_form || null,
      cover_url: parsed.data.cover_url || null,
    });

    const rows = await db.select().from(schema.layanan_cards).where(eq(schema.layanan_cards.id, id));
    const result = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Menambah layanan: ${parsed.data.nama_layanan}`, req.headers.get("x-auth-user-username"));
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
