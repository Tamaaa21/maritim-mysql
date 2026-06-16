import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ALLOWED_FIELDS = [
  "title", "url", "explanation", "slug",
  "waktu_mulai", "waktu_berakhir",
  "next_url", "next_explanation", "next_waktu_mulai", "next_waktu_berakhir",
  "display_type", "gallery_images", "category_id", "prioritas", "is_active",
  "uploader",
];

function sanitize(body: any): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
}

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);

    const { data, error } = await supabase.from("prakiraan_images").select(`*, category:category_id(*)`).eq("id", id).single();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);

    const { data, error } = await supabase.from("prakiraan_images").delete().eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });
    const body = await req.json();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);

    const cleanData = sanitize(body);
    if (Object.keys(cleanData).length === 0) {
      return NextResponse.json({ success: false, message: "Tidak ada field yang valid untuk diupdate" }, { status: 400 });
    }

    const { data, error } = await supabase.from("prakiraan_images").update(cleanData).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
