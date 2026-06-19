import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql";
import { verifyPassword, hashPassword, createSessionToken, setAuthCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { serverError } from "@/lib/response";

export const runtime = "nodejs";

const badRequest = (message: string) =>
  NextResponse.json({ message }, { status: 400 });

const unauthorized = (message: string) =>
  NextResponse.json({ message }, { status: 401 });

const forbidden = (message: string) =>
  NextResponse.json({ message }, { status: 403 });

const tooManyRequests = (message: string) =>
  NextResponse.json({ message }, { status: 429 });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Username dan password harus diisi");
    }

    const { username, password } = parsed.data;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const rateKey = `login:${ip}:${username}`;
    const rateCheck = checkRateLimit(rateKey);

    if (!rateCheck.allowed) {
      return tooManyRequests("Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.");
    }

    const rows = await query<any>(
      "SELECT id, username, password, role, nama, is_active FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    const user = rows[0];

    if (!user) {
      return unauthorized("Username atau password salah");
    }

    if (!user.is_active) {
      return forbidden("Akun ini telah dinonaktifkan");
    }

    let passwordValid: boolean;
    if (user.password.startsWith("$2")) {
      passwordValid = await verifyPassword(password, user.password);
    } else {
      passwordValid = user.password === password;
      if (passwordValid) {
        const hashed = await hashPassword(password);
        await execute("UPDATE users SET password = ? WHERE id = ?", [hashed, user.id]);
      }
    }

    if (!passwordValid) {
      return unauthorized("Username atau password salah");
    }

    const token = await createSessionToken(user.id, user.role, user.username);

    const userAgent = request.headers.get("user-agent") || "unknown";
    try {
      await execute(
        "INSERT INTO login_logs (id, user_id, username, ip_address, user_agent, aktivitas) VALUES (UUID(), ?, ?, ?, ?, ?)",
        [user.id, user.username, ip || "unknown", userAgent || "unknown", "Login ke panel admin"]
      );
    } catch (logError) {
      console.error("Failed to record login log:", logError);
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nama: user.nama,
      },
      message: "Login berhasil",
    }, { status: 200 });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
