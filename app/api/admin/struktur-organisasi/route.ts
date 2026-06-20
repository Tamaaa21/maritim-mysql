import crypto from "node:crypto";
import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { logActivity } from "@/lib/activity-log";
import { strukturOrganisasiSchema } from "@/lib/validation";
import { ok, badRequest, serverError } from "@/lib/response";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(schema.struktur_organisasi).orderBy(asc(schema.struktur_organisasi.urutan));
    return ok(rows);
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

    const id = crypto.randomUUID() as string;
    await db.insert(schema.struktur_organisasi).values({
      id,
      jabatan: parsed.data.jabatan,
      nama: parsed.data.nama || "",
      inisial: parsed.data.inisial || "",
      deskripsi: parsed.data.deskripsi || null,
      urutan: typeof parsed.data.urutan === "number" ? parsed.data.urutan : 0,
    });

    const rows = await db.select().from(schema.struktur_organisasi).where(eq(schema.struktur_organisasi.id, id));
    const result = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Menambah struktur organisasi: ${parsed.data.jabatan}`, req.headers.get("x-auth-user-username"));
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}
