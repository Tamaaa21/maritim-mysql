import { NextResponse } from "next/server";
import { db, schema } from "@/db";
import { sql, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(schema.users).where(eq(schema.users.is_active, true));
    return NextResponse.json({ count: result.count || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}
