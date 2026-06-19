import { NextResponse } from "next/server";
import crypto from "crypto";
import { execute } from "@/lib/mysql";
import type { BukuTamu } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let records: Partial<BukuTamu>[] = [];
    if (body.records && Array.isArray(body.records)) {
      records = body.records;
    } else if (Array.isArray(body)) {
      records = body;
    } else {
      return NextResponse.json({ success: false, message: "Format data tidak valid" }, { status: 400 });
    }

    if (records.length === 0) {
      return NextResponse.json({ success: false, message: "Tidak ada data untuk direstore" }, { status: 400 });
    }

    let inserted = 0;
    for (const r of records) {
      const id = crypto.randomUUID();
      await execute(
        "INSERT INTO buku_tamu (id, nama, email, no_telepon, instansi, keperluan, foto_url, foto_data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          r.nama,
          r.email,
          r.no_telepon,
          r.instansi || null,
          r.keperluan,
          r.foto_url || null,
          r.foto_data || null,
          r.created_at || new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil merestore ${inserted} data buku tamu`,
      count: inserted,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
