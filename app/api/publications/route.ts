import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { okCached, serverError } from "@/lib/response";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("publications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return okCached(data || []);
  } catch (error) {
    return serverError(error);
  }
}
