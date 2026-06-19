import crypto from "node:crypto";
import { query, execute } from "@/lib/mysql";
import { logActivity } from "@/lib/activity-log";
import { strukturOrganisasiSchema } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/response";
import type { StrukturOrganisasi } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query<any>(
      "SELECT * FROM struktur_organisasi ORDER BY urutan ASC"
    );
    return ok(rows as StrukturOrganisasi[]);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = strukturOrganisasiSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const id = crypto.randomUUID();
    await execute(
      "INSERT INTO struktur_organisasi (id, jabatan, nama, inisial, deskripsi, urutan) VALUES (?, ?, ?, ?, ?, ?)",
      [
        id,
        parsed.data.jabatan,
        parsed.data.nama || "",
        parsed.data.inisial || null,
        parsed.data.deskripsi || null,
        typeof parsed.data.urutan === "number" ? parsed.data.urutan : 0,
      ]
    );

    const rows = await query<any>(
      "SELECT * FROM struktur_organisasi WHERE id = ?",
      [id]
    );
    const result = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Menambah struktur organisasi: ${parsed.data.jabatan}`, req.headers.get("x-auth-user-username"));
    return ok(result as StrukturOrganisasi);
  } catch (error) {
    return serverError(error);
  }
}
