import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id || (() => { try { return new URL(req.url).pathname.split('/').pop(); } catch { return undefined } })();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);

    const { data, error } = await supabase.from("prakiraan_images").select("*").eq("id", id).single();
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
    const id = params?.id || (() => { try { return new URL(req.url).pathname.split('/').pop(); } catch { return undefined } })();
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
    const id = params?.id || (() => { try { return new URL(req.url).pathname.split('/').pop(); } catch { return undefined } })();
    const body = await req.json();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);

    const { data, error } = await supabase.from("prakiraan_images").update(body).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
