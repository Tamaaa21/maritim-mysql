import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity-log";
import { layananCardSchema } from "@/lib/validation";
import { okCached, ok, badRequest, serverError } from "@/lib/response";
import type { LayananCard } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("layanan_cards")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return okCached(data as LayananCard[]);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = layananCardSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("layanan_cards")
      .insert({
        nama_layanan: parsed.data.nama_layanan,
        deskripsi: parsed.data.deskripsi || null,
        url_google_form: parsed.data.url_google_form || null,
        cover_url: parsed.data.cover_url || null,
      })
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user-id"), `Menambah layanan: ${parsed.data.nama_layanan}`, req.headers.get("x-auth-user-username"));
    return ok(data as LayananCard);
  } catch (error) {
    return serverError(error);
  }
}
