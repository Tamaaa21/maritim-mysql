import { NextResponse } from "next/server";
import crypto from "crypto";
import { db, schema } from "@/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let records: any[] = [];
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
      await db.insert(schema.buku_tamu).values({
        id: id as string,
        nama: r.nama,
        email: r.email,
        no_telepon: r.no_telepon,
        instansi: r.instansi || null,
        keperluan: r.keperluan,
        foto_url: r.foto_url || null,
        foto_data: r.foto_data || null,
        created_at: r.created_at || new Date().toISOString() as any,
        updated_at: new Date().toISOString() as any,
      });
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil merestore ${inserted} data buku tamu`,
      count: inserted,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal restore buku tamu" }, { status: 500 });
  }
}
