import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { uploadMultipleFiles } from "@/lib/upload";
import { logActivity } from "@/lib/activity-log";
import { ok, okCached, badRequest, serverError } from "@/lib/response";
import type { KegiatanDocument } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const supabase: any = getSupabaseAdmin();

    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const singleFile = form.get("file") as File | null;
    const title = form.get("title")?.toString() || singleFile?.name || `kegiatan-${Date.now()}`;
    const description = form.get("description")?.toString() || null;
    const event_date = form.get("event_date")?.toString() || null;
    const youtube_url = form.get("youtube_url")?.toString() || null;

    const allFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);
    if (allFiles.length === 0 && !youtube_url) {
      return badRequest("No file or YouTube link provided");
    }

    const insertData: Record<string, unknown> = { title };

    if (allFiles.length > 0) {
      const uploaded = await uploadMultipleFiles(allFiles, "kegiatan");
      const imageUrls = uploaded.map(u => u.url);
      const firstFile = uploaded[0];
      insertData.url = firstFile.url;
      insertData.file_path = firstFile.path;
      insertData.file_type = allFiles[0].type;
      insertData.image_urls = imageUrls;
    } else if (youtube_url) {
      const ytId = getYouTubeId(youtube_url);
      if (ytId) insertData.url = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    if (description) insertData.description = description;
    if (event_date) insertData.event_date = event_date;
    if (youtube_url) insertData.youtube_url = youtube_url;

    const { data: result, error: insertError } = await supabase
      .from("kegiatan_documents")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      const msg = String(insertError.message || insertError);
      if (msg.includes("Could not find the table")) {
        return NextResponse.json({
          success: false,
          message: "Tabel kegiatan_documents belum dibuat di database. Jalankan migration SQL di Supabase dashboard.",
        }, { status: 500 });
      }
      throw insertError;
    }

    logActivity(req.headers.get("x-auth-user-id"), `Menambah dokumentasi kegiatan: ${title}`, req.headers.get("x-auth-user-username"));
    return ok(result as KegiatanDocument);
  } catch (error) {
    return serverError(error);
  }
}

export async function GET() {
  try {
    const supabase: any = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("kegiatan_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      const msg = String(error.message || error);
      if (msg.includes("Could not find the table")) {
        console.warn("kegiatan_documents table missing in Supabase schema");
        return ok([] as KegiatanDocument[]);
      }
      throw error;
    }
    return okCached(data as KegiatanDocument[]);
  } catch (error) {
    return serverError(error);
  }
}
