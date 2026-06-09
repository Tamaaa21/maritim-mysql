import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false, data: [] }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);
    const { data, error } = await supabase.from("prakiraan_categories").select("*").order("name", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, icon } = body;
    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Nama kategori harus diisi" }, { status: 400 });
    }
    const slug = slugify(name);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);
    const { data, error } = await supabase
      .from("prakiraan_categories")
      .insert({ name: name.trim(), slug, description: description || null, icon: icon || "Sun" })
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: false, message: "Kategori dengan nama tersebut sudah ada" }, { status: 409 });
      }
      throw error;
    }
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
