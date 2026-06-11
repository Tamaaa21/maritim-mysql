import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("login_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, message: "Database config missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    // Delete all records by matching a condition that is always true
    const { error } = await supabase
      .from("login_logs")
      .delete()
      .neq("id", "0");

    if (error) throw error;
    return NextResponse.json({ success: true, message: "Semua riwayat login berhasil dihapus" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
