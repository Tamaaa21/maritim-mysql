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
      await db.insert(schema.login_logs).values({
        id,
        user_id: r.user_id,
        username: r.username,
        ip_address: r.ip_address || null,
        user_agent: r.user_agent || null,
        created_at: r.created_at || new Date().toISOString(),
      });
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil merestore ${inserted} data login logs`,
      count: inserted,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal restore log login" }, { status: 500 });
  }
}
