import crypto from "crypto";
import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { okCached, serverError } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const data = await db.select().from(schema.prakiraan_categories).orderBy(asc(schema.prakiraan_categories.name));
    return okCached(data || []);
  } catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, icon } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Nama kategori harus diisi" }, { status: 400 });
    }

    const slug = slugify(name);

    const existing = await db.select({ id: schema.prakiraan_categories.id }).from(schema.prakiraan_categories).where(eq(schema.prakiraan_categories.name, name.trim()));
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Kategori dengan nama tersebut sudah ada" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    await db.insert(schema.prakiraan_categories).values({
      id,
      name: name.trim(),
      slug,
      description: description || null,
      icon: icon || "Sun",
    });

    const [data] = await db.select().from(schema.prakiraan_categories).where(eq(schema.prakiraan_categories.id, id));

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menambah kategori prakiraan: ${name}`,
      req.headers.get("x-auth-user-username")
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal memproses kategori" }, { status: 500 });
  }
}
