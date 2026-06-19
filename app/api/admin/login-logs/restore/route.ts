import { NextResponse } from "next/server";
import crypto from "crypto";
import { execute } from "@/lib/mysql";
import type { LoginLog } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let records: Partial<LoginLog>[] = [];
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
        "INSERT INTO login_logs (id, user_id, username, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
          id,
          r.user_id,
          r.username,
          r.ip_address || null,
          r.user_agent || null,
          r.created_at || new Date().toISOString(),
        ]
      );
      inserted++;
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil merestore ${inserted} data login logs`,
      count: inserted,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
