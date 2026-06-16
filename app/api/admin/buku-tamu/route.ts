import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) {
      console.warn("Supabase URL not set");
      return NextResponse.json([], { status: 500 });
    }

    const key = serviceKey || anonKey;
    const supabase = createClient(url, key as string);

    const { data, error } = await supabase
      .from("buku_tamu")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false, message: "Supabase config missing" }, { status: 500 });

    const supabase = createClient(url, serviceKey);
    let ids: string[] = [];
    
    try {
      const body = await req.json();
      if (body.ids && Array.isArray(body.ids)) {
        ids = body.ids;
      }
    } catch (e) {
      // no body
    }

    if (ids.length > 0) {
      const { error } = await supabase.from("buku_tamu").delete().in("id", ids);
      if (error) throw error;
      logActivity(req.headers.get("x-auth-user"), `Menghapus ${ids.length} data buku tamu`, req);
      return NextResponse.json({ success: true, message: "Data terpilih berhasil dihapus" });
    } else {
      const { error } = await supabase.from("buku_tamu").delete().neq("id", "0");
      if (error) throw error;
      logActivity(req.headers.get("x-auth-user"), `Menghapus semua data buku tamu`, req);
      return NextResponse.json({ success: true, message: "Semua data berhasil dihapus" });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
