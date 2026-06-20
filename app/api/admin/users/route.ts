import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { hashPassword, forbidden } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { createUserSchema } from "@/lib/validation";

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
    const data = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      role: schema.users.role,
      nama: schema.users.nama,
      is_active: schema.users.is_active,
      created_at: schema.users.created_at,
    })
      .from(schema.users)
      .orderBy(asc(schema.users.created_at));
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat menambah pengguna");
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors.map(e => e.message).join(", ") }, { status: 400 });
    }

    const { username, password, role: newRole, nama } = parsed.data;

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username dan password harus diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
    }

    if (newRole === "super_admin" && role !== "super_admin") {
      return forbidden("Hanya Super Admin yang dapat membuat akun Super Admin");
    }

    const existing = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Username sudah digunakan" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const id = crypto.randomUUID();

    await db.insert(schema.users).values({
      id,
      username,
      password: hashedPassword,
      role: newRole || "karyawan",
      nama: nama || username,
    });

    const rows = await db.select({
      id: schema.users.id,
      username: schema.users.username,
      role: schema.users.role,
      nama: schema.users.nama,
      is_active: schema.users.is_active,
      created_at: schema.users.created_at,
    })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    const data = rows[0];

    logActivity(getUserId(request), `Menambah pengguna: ${username}`, getUsername(request));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal menambah pengguna" }, { status: 500 });
  }
}
