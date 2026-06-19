import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/mysql";
import { hashPassword, forbidden } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

function getId(request: NextRequest, context: any): string | undefined {
  try {
    const pathname = request.nextUrl.pathname;
    return pathname.split('/').pop();
  } catch {
    return undefined;
  }
}

function getUsername(request: NextRequest) {
  return request.headers.get("x-auth-user-username") || "";
}

function getRole(request: NextRequest) {
  return request.headers.get("x-auth-user-role") || "";
}

function getUserId(request: NextRequest) {
  return request.headers.get("x-auth-user-id") || "";
}

export async function PATCH(request: NextRequest, context: any) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat mengubah pengguna");
  }

  try {
    const id = getId(request, context);
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const body = await request.json();

    const updateData: any = {};
    if (body.nama !== undefined) updateData.nama = body.nama;
    if (body.role !== undefined) {
      if (body.role === "super_admin" && role !== "super_admin") {
        return forbidden("Hanya Super Admin yang dapat mengubah role ke Super Admin");
      }
      updateData.role = body.role;
    }
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
      }
      updateData.password = await hashPassword(body.password);
    }

    const setClauses = Object.keys(updateData).map(key => `${key} = ?`);
    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, message: "Tidak ada data yang diubah" }, { status: 400 });
    }

    const values = Object.values(updateData);
    await execute(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`,
      [...values, id]
    );

    const rows = await query<any>(
      "SELECT id, username, role, nama, is_active, created_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    const data = rows[0];

    if (!data) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    logActivity(getUserId(request), `Mengubah pengguna: ${data?.username || id}`, getUsername(request));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return forbidden("Hanya admin yang dapat menghapus pengguna");
  }

  try {
    const id = getId(request, context);
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const rows = await query<any>(
      "SELECT id, username FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    const user = rows[0];

    const result = await execute("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    logActivity(getUserId(request), `Menghapus pengguna: ${user?.username || id}`, getUsername(request));
    return NextResponse.json({ success: true, data: user || { id } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
