import crypto from "crypto";
import { db, schema } from "@/db";

export async function logActivity(
  userId: string | null | undefined,
  aktivitas: string,
  username?: string | null
) {
  if (!userId) return;

  try {
    await db.insert(schema.login_logs).values({
      id: crypto.randomUUID(),
      user_id: userId,
      username: username || "unknown",
      aktivitas,
    });
  } catch (error) {
    console.error("[logActivity] Gagal mencatat aktivitas:", error);
  }
}
