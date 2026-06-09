import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const slug = params?.slug;
    if (!slug) return NextResponse.json({ success: false, message: "Slug required" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from("prakiraan_images")
      .select(`*, category:category_id(*)`)
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
      }
      throw error;
    }
    if (!data) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
