import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id || (() => { try { return new URL(req.url).pathname.split('/').pop(); } catch { return undefined } })();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });
    
    const supabase = createClient(url, serviceKey);

    const { data, error } = await supabase
      .from("layanan_cards")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data: data?.[0] || null });
  } catch (error: any) {
    console.error("DELETE /api/admin/layanan-cards/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id || (() => { try { return new URL(req.url).pathname.split('/').pop(); } catch { return undefined } })();
    const body = await req.json();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });

    const supabase = createClient(url, serviceKey);

    const { nama_layanan, deskripsi, url_google_form, cover_url } = body;
    const updateObj: any = {};
    if (nama_layanan !== undefined) updateObj.nama_layanan = nama_layanan;
    if (deskripsi !== undefined) updateObj.deskripsi = deskripsi;
    if (url_google_form !== undefined) updateObj.url_google_form = url_google_form || null;
    if (cover_url !== undefined) updateObj.cover_url = cover_url || null;
    updateObj.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("layanan_cards")
      .update(updateObj)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("PATCH /api/admin/layanan-cards/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
