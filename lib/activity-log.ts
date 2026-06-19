import { query, execute } from "@/lib/mysql";

export async function logActivity(
  userId: string | null | undefined,
  aktivitas: string,
  username?: string | null
) {
  if (!userId) return;

  let finalUsername = username || "";

  if (!finalUsername) {
    const rows = await query<any>("SELECT username FROM users WHERE id = ? LIMIT 1", [userId]);
    finalUsername = rows[0]?.username || "unknown";
  }

  try {
    await execute(
      "INSERT INTO login_logs (id, user_id, username, aktivitas) VALUES (UUID(), ?, ?, ?)",
      [userId, finalUsername, aktivitas]
    );
  } catch (error) {
    console.error("[logActivity] Gagal mencatat aktivitas:", error);
  }
}
