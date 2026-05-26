import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { error } = await supabase.from("layanan_berbayar").insert([
      {
        email: data.email,
        nama_lengkap: data.nama_lengkap,
        alamat: data.alamat,
        instansi: data.instansi,
        no_hp: data.no_hp,
        status: "pending",
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}
