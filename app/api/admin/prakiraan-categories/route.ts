import { NextResponse } from "next/server";
import { logActivity } from "@/lib/activity-log";
import { query, execute } from "@/lib/mysql";
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
    const data = await query("SELECT * FROM prakiraan_categories ORDER BY name ASC");
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

    const existing = await query("SELECT id FROM prakiraan_categories WHERE name = ?", [name.trim()]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Kategori dengan nama tersebut sudah ada" }, { status: 409 });
    }

    const id = crypto.randomUUID();
    await execute(
      "INSERT INTO prakiraan_categories (id, name, slug, description, icon) VALUES (?, ?, ?, ?, ?)",
      [id, name.trim(), slug, description || null, icon || "Sun"]
    );

    const [data] = await query("SELECT * FROM prakiraan_categories WHERE id = ?", [id]);

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menambah kategori prakiraan: ${name}`,
      req.headers.get("x-auth-user-username")
    );
    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menambah kategori prakiraan: ${name}`,
      req.headers.get("x-auth-user-username")
    );

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
