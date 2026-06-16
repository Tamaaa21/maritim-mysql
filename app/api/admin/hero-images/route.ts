import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn("Supabase URL or service key not set");
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey as string);

    const form = await (req as any).formData();
    const file = form.get("file") as any;
    const name = (form.get("name") as any)?.toString() || file?.name || `hero-${Date.now()}`;
    const orderIndex = form.get("order") ? parseInt((form.get("order") as any).toString(), 10) : 0;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
    const path = `hero/${filename}`;

    let { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) {
      // Try to create the bucket if it doesn't exist, then retry once
      try {
        await supabase.storage.createBucket(bucket, { public: true });
        const retry = await supabase.storage.from(bucket).upload(path, buffer, {
          contentType: file.type,
          upsert: true,
        });
        uploadData = retry.data;
        uploadError = retry.error;
      } catch (bErr) {
        console.error("Bucket create or retry failed", bErr);
      }
    }

    if (uploadError) throw uploadError;

    if (!uploadData || !uploadData.path) {
      throw new Error('Upload succeeded but returned no path');
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    const publicUrl = (urlData as any)?.publicUrl || "";

    const { data: insertData, error: insertError } = await supabase.from("hero_images").insert({
      name,
      url: publicUrl,
      order_index: orderIndex,
    }).select().single();

    if (insertError) throw insertError;

    logActivity(req.headers.get("x-auth-user"), `Menambah hero slider: ${name}`, req);

    return NextResponse.json({ success: true, data: insertData });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn("Supabase URL or service key not set");
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey as string);
    const { data, error } = await supabase.from("hero_images").select("*").order("order_index", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
