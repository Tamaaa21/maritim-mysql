import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const key = serviceKey || anonKey;
    const supabase = createClient(url, key as string);

    const { data, error } = await supabase
      .from("buku_tamu")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    const backupData = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      total: data?.length || 0,
      records: data || [],
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="buku_tamu_backup_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
