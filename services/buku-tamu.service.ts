import crypto from "crypto";
import { db, schema } from "@/db";
import { desc, inArray } from "drizzle-orm";

export async function getAllBukuTamu() {
  return db
    .select()
    .from(schema.buku_tamu)
    .orderBy(desc(schema.buku_tamu.created_at));
}

export async function deleteBukuTamu(ids: string[]) {
  const result = await db
    .delete(schema.buku_tamu)
    .where(inArray(schema.buku_tamu.id, ids));
  return result[0]?.affectedRows ?? 0;
}

export async function deleteAllBukuTamu() {
  await db.delete(schema.buku_tamu);
  return 0;
}

export async function submitBukuTamu(data: {
  nama: string; email: string; no_telepon: string; instansi?: string;
  keperluan: string; foto_data?: string
}) {
  const id = crypto.randomUUID();
  await db.insert(schema.buku_tamu).values({
    id,
    nama: data.nama,
    email: data.email,
    no_telepon: data.no_telepon,
    instansi: data.instansi || "",
    keperluan: data.keperluan,
    foto_data: data.foto_data || null,
  });
  return id;
}
