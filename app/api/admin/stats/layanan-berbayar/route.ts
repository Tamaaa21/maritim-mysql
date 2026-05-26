import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { count } = await supabase
      .from("layanan_berbayar")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}
