import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const { data, error } = await supabase
      .from("users")
      .select("id, username, role, nama, is_active, created_at")
      .order("created_at", { ascending: true });

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
    const { username, password, role, nama } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username dan password harus diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, message: "Username sudah digunakan" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
      .from("users")
      .insert({
        username,
        password: hashedPassword,
        role: role || "karyawan",
        nama: nama || username,
      })
      .select("id, username, role, nama, is_active, created_at")
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user"), `Menambah pengguna: ${username}`, req);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
