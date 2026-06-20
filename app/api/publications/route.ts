import { db, schema } from "@/db";
import { desc } from "drizzle-orm";
import { okCached, serverError } from "@/lib/response";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await db.select().from(schema.publications).orderBy(desc(schema.publications.created_at));
    return okCached(data || []);
  } catch (error) {
    return serverError(error);
  }
}
