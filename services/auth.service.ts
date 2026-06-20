import crypto from "crypto";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, createSessionToken, checkRateLimit } from "@/lib";
import { NextResponse } from "next/server";

export type LoginResult =
  | { success: true; token: string; user: { id: string; username: string; role: string; nama: string | null } }
  | { success: false; response: NextResponse };

export async function login(username: string, password: string, ip: string): Promise<LoginResult> {
  const rateKey = `login:${ip}:${username}`;
  const rateCheck = checkRateLimit(rateKey);
  if (!rateCheck.allowed) {
    return { success: false, response: NextResponse.json({ message: "Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit." }, { status: 429 }) };
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);

  if (!user) {
    return { success: false, response: NextResponse.json({ message: "Username atau password salah" }, { status: 401 }) };
  }
  if (!user.is_active) {
    return { success: false, response: NextResponse.json({ message: "Akun ini telah dinonaktifkan" }, { status: 403 }) };
  }

  let passwordValid: boolean;
  if (user.password.startsWith("$2")) {
    passwordValid = await verifyPassword(password, user.password);
  } else {
    passwordValid = user.password === password;
    if (passwordValid) {
      const hashed = await hashPassword(password);
      await db.update(schema.users).set({ password: hashed }).where(eq(schema.users.id, user.id));
    }
  }
  if (!passwordValid) {
    return { success: false, response: NextResponse.json({ message: "Username atau password salah" }, { status: 401 }) };
  }

  const token = await createSessionToken(user.id, user.role, user.username);
  return {
    success: true,
    token,
    user: { id: user.id, username: user.username, role: user.role, nama: user.nama },
  };
}

export async function recordLoginLog(userId: string, username: string, ip: string, userAgent: string) {
  try {
    await db.insert(schema.login_logs).values({
      id: crypto.randomUUID(),
      user_id: userId,
      username,
      ip_address: ip,
      user_agent: userAgent,
      aktivitas: "Login ke panel admin",
    });
  } catch (error) {
    console.error("Failed to record login log:", error);
  }
}

export async function getCurrentUser(userId: string) {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return user || null;
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const [user] = await db
    .select({ password: schema.users.password })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!user) return { success: false, message: "User tidak ditemukan" };

  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) return { success: false, message: "Password saat ini salah" };

  const hashed = await hashPassword(newPassword);
  await db.update(schema.users).set({ password: hashed }).where(eq(schema.users.id, userId));
  return { success: true, message: "Password berhasil diubah" };
}
