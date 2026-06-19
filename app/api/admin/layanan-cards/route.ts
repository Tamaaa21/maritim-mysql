import crypto from "node:crypto";
import { query, execute } from "@/lib/mysql";
import { logActivity } from "@/lib/activity-log";
import { layananCardSchema } from "@/lib/validation";
import { okCached, ok, badRequest, serverError } from "@/lib/response";
import type { LayananCard } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query<any>(
      "SELECT * FROM layanan_cards ORDER BY created_at ASC"
    );
    return okCached(rows as LayananCard[]);
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
    await execute(
      "INSERT INTO layanan_cards (id, nama_layanan, deskripsi, url_google_form, cover_url) VALUES (?, ?, ?, ?, ?)",
      [
        id,
        parsed.data.nama_layanan,
        parsed.data.deskripsi || null,
        parsed.data.url_google_form || null,
        parsed.data.cover_url || null,
      ]
    );

    const rows = await query<any>(
      "SELECT * FROM layanan_cards WHERE id = ?",
      [id]
    );
    const result = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Menambah layanan: ${parsed.data.nama_layanan}`, req.headers.get("x-auth-user-username"));
    return ok(result as LayananCard);
  } catch (error) {
    return serverError(error);
  }
}
