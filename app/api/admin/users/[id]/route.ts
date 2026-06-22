import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { hashPassword, forbidden } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { updateUserSchema } from "@/lib/validation";
import { getRole, getUsername, getUserId } from "@/services/admin.service";

export const runtime = "nodejs";

function getId(request: NextRequest): string | undefined {
  try {
    const pathname = request.nextUrl.pathname;
    return pathname.split('/').pop();
  } catch {
    return undefined;
  }
}

export async function PATCH(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin") {
    return forbidden("Hanya Super Admin yang dapat mengubah pengguna");
  }

  try {
    const id = getId(request);
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors.map(e => e.message).join(", ") }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.nama !== undefined) updateData.nama = parsed.data.nama;
    if (parsed.data.role !== undefined) {
      if (parsed.data.role === "super_admin" && role !== "super_admin") {
        return forbidden("Hanya Super Admin yang dapat mengubah role ke Super Admin");
      }
      updateData.role = parsed.data.role;
    }
    if (parsed.data.is_active !== undefined) updateData.is_active = parsed.data.is_active;
    if (parsed.data.password) {
      if (parsed.data.password.length < 6) {
        return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
      }
      updateData.password = await hashPassword(parsed.data.password);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: "Tidak ada data yang diubah" }, { status: 400 });
    }

    await db.update(schema.users).set(updateData).where(eq(schema.users.id, id));

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

    if (!data) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    logActivity(getUserId(request), `Mengubah pengguna: ${data?.username || id}`, getUsername(request));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal mengubah pengguna" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin") {
    return forbidden("Hanya Super Admin yang dapat menghapus pengguna");
  }

  try {
    const id = getId(request);
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const rows = await db.select({ id: schema.users.id, username: schema.users.username })
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    const user = rows[0];

    await db.delete(schema.users).where(eq(schema.users.id, id));

    logActivity(getUserId(request), `Menghapus pengguna: ${user?.username || id}`, getUsername(request));
    return NextResponse.json({ success: true, data: user || { id } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
