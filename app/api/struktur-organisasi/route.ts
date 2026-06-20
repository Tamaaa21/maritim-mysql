import { db, schema } from "@/db";
import { asc } from "drizzle-orm";
import { okCached, serverError } from "@/lib/response";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await db.select().from(schema.struktur_organisasi).orderBy(asc(schema.struktur_organisasi.urutan));
    return okCached(data || []);
  } catch (error) {
    return serverError(error);
  }
}
