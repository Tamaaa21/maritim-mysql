import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { query, execute } from "@/lib/mysql";
import { hashPassword, forbidden } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getRole(req: NextRequest) {
  return req.headers.get("x-auth-user-role") || "";
}

function getUsername(req: NextRequest) {
  return req.headers.get("x-auth-user-username") || "";
}

function getUserId(req: NextRequest) {
  return req.headers.get("x-auth-user-id") || "";
}

export async function GET(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat melihat data pengguna");
  }

  try {
    const data = await query(
      "SELECT id, username, role, nama, is_active, created_at FROM users ORDER BY created_at ASC"
    );
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat menambah pengguna");
  }

  try {
    const body = await request.json();
    const { username, password, role: newRole, nama } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username dan password harus diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
    }

    if (newRole === "super_admin" && role !== "super_admin") {
      return forbidden("Hanya Super Admin yang dapat membuat akun Super Admin");
    }

    const existing = await query<any>(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Username sudah digunakan" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();

    await execute(
      "INSERT INTO users (id, username, password, role, nama) VALUES (?, ?, ?, ?, ?)",
      [id, username, hashedPassword, newRole || "karyawan", nama || username]
    );

    const rows = await query<any>(
      "SELECT id, username, role, nama, is_active, created_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    const data = rows[0];

    logActivity(getUserId(request), `Menambah pengguna: ${username}`, getUsername(request));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
