import { NextRequest, NextResponse } from "next/server";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

      return NextResponse.json(
        { token, message: "Login berhasil" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Username atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
