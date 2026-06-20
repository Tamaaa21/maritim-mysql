import { NextRequest, NextResponse } from "next/server";
import { login, recordLoginLog } from "@/services/auth.service";
import { getClientIp, getUserAgent } from "@/services/admin.service";
import { setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Username dan password harus diisi" }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const ip = getClientIp(request);
    const result = await login(username, password, ip);

    if (!result.success) return result.response;

    recordLoginLog(result.user.id, result.user.username, ip, getUserAgent(request));

    const response = NextResponse.json({ user: result.user, message: "Login berhasil" }, { status: 200 });
    setAuthCookie(response, result.token);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
