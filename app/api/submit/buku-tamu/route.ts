import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { error } = await supabase.from("buku_tamu").insert([
      {
        nama: data.nama,
        email: data.email,
        no_telepon: data.no_telepon,
        instansi: data.instansi,
        keperluan: data.keperluan,
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
