import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { uploadFile } from "@/lib/upload";
import { logActivity } from "@/lib/activity-log";
import { okCached, ok, badRequest, serverError } from "@/lib/response";
import type { HeroImage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase: any = getSupabaseAdmin();

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const name = form.get("name")?.toString() || file?.name || `hero-${Date.now()}`;
    const orderIndex = form.get("order") ? parseInt(form.get("order")!.toString(), 10) : 0;

    if (!file) return badRequest("No file provided");

    const { url } = await uploadFile(file, "hero");

    const { data: insertData, error: insertError } = await supabase
      .from("hero_images")
      .insert({ name, url, order_index: orderIndex })
      .select()
      .single();

    if (insertError) throw insertError;

    logActivity(req.headers.get("x-auth-user-id"), `Menambah hero slider: ${name}`, req.headers.get("x-auth-user-username"));

    return ok(insertData as HeroImage);
  } catch (error) {
    return serverError(error);
  }
}

export async function GET() {
  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("hero_images")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) throw error;
    return okCached(data as HeroImage[]);
  } catch (error) {
    return serverError(error);
  }
}
