import { NextResponse } from "next/server";
import { execute } from "@/lib/mysql";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    await execute(
      "INSERT INTO buku_tamu (id, nama, email, no_telepon, instansi, keperluan, foto_data) VALUES (UUID(), ?, ?, ?, ?, ?, ?)",
      [data.nama, data.email, data.no_telepon, data.instansi, data.keperluan, data.foto_data || null]
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
