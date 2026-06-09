import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);

    const form = await (req as any).formData();
    const file = form.get("file") as any;
    if (!file) return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
    const path = `uploads/${filename}`;

    let { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (uploadError) {
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
    if (!uploadData || !uploadData.path) throw new Error("Upload failed: no path returned");

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    const publicUrl = (urlData as any)?.publicUrl || "";

    return NextResponse.json({ success: true, url: publicUrl, path: uploadData.path });
  } catch (error: any) {
    console.error("POST /api/admin/upload error:", error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
