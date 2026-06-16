import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn("Supabase URL or service key not set");
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);
    const { data, error } = await supabase
      .from("layanan_cards")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error("GET /api/admin/layanan-cards error:", error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn("Supabase URL or service key not set");
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey);
    const body = await req.json();
    const { nama_layanan, deskripsi, url_google_form, cover_url } = body;

    if (!nama_layanan) {
      return NextResponse.json({ success: false, message: "Nama layanan wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("layanan_cards")
      .insert({
        nama_layanan,
        deskripsi: deskripsi || null,
        url_google_form: url_google_form || null,
        cover_url: cover_url || null,
      })
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user"), `Menambah layanan: ${nama_layanan}`, req);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("POST /api/admin/layanan-cards error:", error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
