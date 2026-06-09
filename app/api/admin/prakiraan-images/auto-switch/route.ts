import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const now = new Date().toISOString();

    // Find expired forecasts that have next_* data to promote
    const { data: expired, error: fetchError } = await supabase
      .from("prakiraan_images")
      .select("*")
      .not("next_url", "is", null)
      .lt("waktu_berakhir", now);

    if (fetchError) throw fetchError;

    const promoted: string[] = [];
    const archived: string[] = [];

    for (const item of expired || []) {
      // Promote next_* fields to current
      const updateData: any = {
        url: item.next_url,
        explanation: item.next_explanation,
        waktu_mulai: item.next_waktu_mulai,
        waktu_berakhir: item.next_waktu_berakhir,
        next_url: null,
        next_explanation: null,
        next_waktu_mulai: null,
        next_waktu_berakhir: null,
      };

      const { error: updateError } = await supabase
        .from("prakiraan_images")
        .update(updateData)
        .eq("id", item.id);

      if (!updateError) {
        promoted.push(item.title || item.id);
      }
    }

    // Also archive expired items without next_* (set is_active=false if column exists)
    // The existing expiry filter already handles this at query time

    return NextResponse.json({
      success: true,
      promoted,
      archived,
      message: `${promoted.length} konten diperbarui, ${archived.length} diarsipkan`,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
