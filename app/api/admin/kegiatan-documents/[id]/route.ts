import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id || (() => { try { return new URL(req.url).pathname.split('/').pop(); } catch { return undefined } })();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);

    // fetch row to get file_path
    const { data: row } = await supabase.from("kegiatan_documents").select("*").eq("id", id).single();
    // attempt remove storage object if file_path exists
    try {
      if (row?.file_path) {
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
        await supabase.storage.from(bucket).remove([row.file_path]);
      }
    } catch (e) {
      console.warn("Failed to remove storage object", e);
    }

    const { data, error } = await supabase.from("kegiatan_documents").delete().eq("id", id).select().single();
    if (error) throw error;
    logActivity(req.headers.get("x-auth-user"), `Menghapus dokumentasi kegiatan: ${data?.title || id}`, req);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id || (() => { try { return new URL(req.url).pathname.split('/').pop(); } catch { return undefined } })();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ success: false }, { status: 500 });
    const supabase = createClient(url, serviceKey as string);

    let body: any = {};
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const form = await (req as any).formData();
      const files = form.getAll("files") as any[];
      const description = form.get("description");
      const event_date = form.get("event_date");
      const category = form.get("category");
      const title = form.get("title");
      const youtube_url = form.get("youtube_url");

      if (title) body.title = title.toString();
      if (description) body.description = description.toString();
      if (event_date) body.event_date = event_date.toString();
      if (category) body.category = category.toString();
      if (youtube_url !== null) body.youtube_url = youtube_url.toString() || null;

      if (files && files.length > 0) {
        const bucket = process.env.SUPABASE_STORAGE_BUCKET || "public";
        const uploaded = await Promise.all(files.map(async (file: any) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const path = `kegiatan/${filename}`;

          const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(path, buffer, {
            contentType: file.type,
            upsert: true,
          });

          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadData!.path);
          return { url: (urlData as any)?.publicUrl || "", path: uploadData!.path, type: file.type };
        }));

        const imageUrls = uploaded.map(u => u.url);
        const firstFile = uploaded[0];
        body.url = firstFile.url;
        body.file_path = firstFile.path;
        body.file_type = firstFile.type;
        body.image_urls = imageUrls;
      }
    } else {
      body = await req.json();
    }

    const { data, error } = await supabase.from("kegiatan_documents").update(body).eq("id", id).select().single();
    if (error) throw error;
    logActivity(req.headers.get("x-auth-user"), `Mengubah dokumentasi kegiatan: ${data?.title || id}`, req);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
