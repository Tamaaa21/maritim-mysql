import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/auth";

export async function logActivity(
  userId: string | null | undefined,
  aktivitas: string,
  req?: Request
) {
  let uid = userId;

  if (!uid && req) {
    const auth = await getAuthUser(req);
    if (auth.authenticated && auth.userId) {
      uid = auth.userId;
    }
  }

  if (!uid) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: user } = await supabase
    .from("users")
    .select("username")
    .eq("id", uid)
    .single();

  const username = user?.username || "unknown";

  const ipAddress = req?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req?.headers?.get("x-real-ip")
    || "unknown";
  const userAgent = req?.headers?.get("user-agent") || "unknown";

  const { error } = await supabase.from("login_logs").insert({
    user_id: uid,
    username,
    ip_address: ipAddress,
    user_agent: userAgent,
    aktivitas,
  });

  if (error?.message?.includes("column") && error?.message?.includes("aktivitas")) {
    await supabase.from("login_logs").insert({
      user_id: uid,
      username,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  }
}
