import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { hashPassword, forbidden } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { createUserSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRole, getUsername, getUserId } from "@/services/admin.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin") {
    return forbidden("Hanya Super Admin yang dapat melihat data pengguna");
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
  if (role !== "super_admin") {
    return forbidden("Hanya Super Admin yang dapat menambah pengguna");
  }

  // Rate limit: 10 user creations per admin per 1 minute
  const userId = getUserId(request);
  const rateCheck = checkRateLimit(`create-user:${userId}`, 10, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, message: "Terlalu banyak permintaan. Silakan coba lagi nanti." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": "0",
          "Retry-After": "60",
        },
      }
    );
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
      role: newRole || "user",
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
