import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";
import { changePasswordSchema } from "@/lib/validation";
import { badRequest, notFound, serverError } from "@/lib/response";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const { currentPassword, newPassword } = parsed.data;

    const userId = request.headers.get("x-auth-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid, silakan login ulang" }, { status: 401 });
    }

    const rows = await db.select({ id: schema.users.id, password: schema.users.password })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    const user = rows[0];

    if (!user) return notFound("Akun tidak ditemukan");

    const passwordValid = await verifyPassword(currentPassword, user.password);
    if (!passwordValid) return badRequest("Kata sandi lama salah");

    const hashedPassword = await hashPassword(newPassword);

    await db.update(schema.users)
      .set({ password: hashedPassword })
      .where(eq(schema.users.id, user.id));

    logActivity(userId, "Mengubah kata sandi", request.headers.get("x-auth-user-username"));

    return NextResponse.json({ success: true, message: "Kata sandi berhasil diperbarui" });
  } catch (error) {
    return serverError(error);
  }
}
