import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(_request: Request, context: any) {
  const params = (context && context.params) ? context.params : (context && typeof context === 'object' ? (context as any) : null);
  const id = params && params.id ? params.id : (typeof params?.then === 'function' ? (await params).id : undefined);
  const paramsId = id;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url) {
      console.warn("Supabase URL not set");
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const key = serviceKey || anonKey;
    const supabase = createClient(url, key as string);

    const { error } = await supabase
      .from("layanan_berbayar")
      .delete()
      .eq("id", paramsId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
