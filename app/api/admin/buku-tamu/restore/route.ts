import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);
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

    // Strip id to let DB generate new UUIDs, keep other fields
    const insertData = records.map((r: any) => ({
      nama: r.nama,
      email: r.email,
      no_telepon: r.no_telepon,
      instansi: r.instansi || null,
      keperluan: r.keperluan,
      foto_url: r.foto_url || null,
      foto_data: r.foto_data || null,
      created_at: r.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("buku_tamu")
      .insert(insertData)
      .select();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Berhasil merestore ${data?.length || 0} data buku tamu`,
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
