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
    const files = form.getAll("files") as any[];
    const singleFile = form.get("file") as any;
    const title = (form.get("title") as any)?.toString() || singleFile?.name || `kegiatan-${Date.now()}`;
    const description = (form.get("description") as any)?.toString() || null;
    const event_date = (form.get("event_date") as any)?.toString() || null;
    const category = (form.get("category") as any)?.toString() || null;

    const allFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);
    if (allFiles.length === 0) return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";

    const uploadFile = async (file: any) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const path = `kegiatan/${filename}`;

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
      if (!uploadData || !uploadData.path) throw new Error('Upload succeeded but returned no path');

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
      return { url: (urlData as any)?.publicUrl || "", path: uploadData.path, type: file.type };
    };

    const uploaded = await Promise.all(allFiles.map(uploadFile));
    const imageUrls = uploaded.map(u => u.url);
    const firstFile = uploaded[0];

    const insertObj: any = { title, url: firstFile.url, file_path: firstFile.path, file_type: firstFile.type, image_urls: imageUrls };
    if (description) insertObj.description = description;
    if (event_date) insertObj.event_date = event_date;
    if (category) insertObj.category = category;

    const { data: insertData, error: insertError } = await supabase.from("kegiatan_documents").insert(insertObj).select().single();
    if (insertError) {
      const msg = (insertError as any)?.message || String(insertError);
      if (msg.includes("Could not find the table")) {
        return NextResponse.json({ success: false, message: "Tabel kegiatan_documents belum dibuat di database. Jalankan migration SQL di Supabase dashboard." }, { status: 500 });
      }
      throw insertError;
    }

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
    if (!url || !serviceKey) return NextResponse.json({ success: false, data: [] }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);
    const { data, error } = await supabase.from("kegiatan_documents").select("*").order("created_at", { ascending: false });
    if (error) {
      const msg = (error as any)?.message || String(error);
      if (msg.includes("Could not find the table")) {
        console.warn("kegiatan_documents table missing in Supabase schema");
        return NextResponse.json({ success: true, data: [] });
      }
      throw error;
    }
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
