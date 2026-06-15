import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword, hashPassword } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Semua field harus diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Kata sandi baru minimal 6 karakter" }, { status: 400 });
    }

    const userId = request.headers.get("x-auth-user");
    if (!userId) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, message: "Konfigurasi server tidak lengkap" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, password")
      .eq("id", userId)
      .single();

    if (findError || !user) {
      return NextResponse.json({ success: false, message: "Akun tidak ditemukan" }, { status: 404 });
    }

    const passwordValid = await verifyPassword(oldPassword, user.password);
    if (!passwordValid) {
      return NextResponse.json({ success: false, message: "Kata sandi lama salah" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update password error:", updateError);
      return NextResponse.json({ success: false, message: "Gagal memperbarui kata sandi di database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Kata sandi berhasil diperbarui" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
