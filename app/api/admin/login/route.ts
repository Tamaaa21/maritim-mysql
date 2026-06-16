import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPassword, hashPassword, createSessionToken } from "@/lib/auth";

export const runtime = "nodejs";

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true;

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });
    const data = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password, recaptchaToken } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    if (!recaptchaToken || !(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json(
        { message: "Verifikasi captcha gagal, silakan coba lagi" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { message: "Akun ini telah dinonaktifkan" },
        { status: 403 }
      );
    }

    let passwordValid: boolean;
    if (user.password.startsWith("$2")) {
      passwordValid = await verifyPassword(password, user.password);
    } else {
      passwordValid = user.password === password;
      if (passwordValid) {
        const hashed = await hashPassword(password);
        await supabase.from("users").update({ password: hashed }).eq("id", user.id);
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.id, user.role);

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    const logInsert: any = {
      user_id: user.id,
      username: user.username,
      ip_address: ipAddress || "unknown",
      user_agent: userAgent || "unknown",
    };
    const { error: logError } = await supabase.from("login_logs").insert({ ...logInsert, aktivitas: "Login ke panel admin" });

    if (logError?.message?.includes("column") && logError?.message?.includes("aktivitas")) {
      await supabase.from("login_logs").insert(logInsert);
    } else if (logError) {
      console.error("Failed to record login log:", logError);
    }

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nama: user.nama,
      },
      message: "Login berhasil",
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
