import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_DISPLAY_TYPES = ["gambar_saja", "gambar_teks", "gambar_galeri"];

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn("Supabase URL or service key not set");
      return NextResponse.json({ success: false, message: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(url, serviceKey as string);

    const contentType = (req.headers && (req.headers as any).get ? (req.headers as any).get('content-type') : '');

    const uploadFile = async (fileField: string) => {
      const f = form.get(fileField) as any;
      if (!f) return null;
      const ab = await f.arrayBuffer();
      const buf = Buffer.from(ab);
      const fn = `${Date.now()}_${f.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'public';
      const fp = `prakiraan/${fn}`;
      let { data: ud, error: ue } = await supabase.storage.from(bucket).upload(fp, buf, {
        contentType: f.type,
        upsert: true,
      });
      if (ue) {
        try {
          await supabase.storage.createBucket(bucket, { public: true });
          const retry = await supabase.storage.from(bucket).upload(fp, buf, {
            contentType: f.type,
            upsert: true,
          });
          ud = retry.data;
          ue = retry.error;
        } catch (bErr) {
          console.error('Bucket create or retry failed', bErr);
        }
      }
      if (ue) throw ue;
      if (!ud || !ud.path) throw new Error('Upload succeeded but returned no path');
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(ud.path);
      return (urlData as any)?.publicUrl || '';
    };

    // If JSON body provided, allow creating an entry from an existing URL (useful for default images)
    if (contentType && contentType.includes('application/json')) {
      const body = await req.json();
      const title = body.title || `prakiraan-${Date.now()}`;
      const explanation = body.explanation || null;
      const providedUrl = body.url;
      const uploader = body.uploader || null;
      const waktuBerakhir = body.waktu_berakhir || body.waktuBerakhir || null;
      const waktuMulai = body.waktu_mulai || body.waktuMulai || null;
      const nextUrl = body.next_url || body.nextUrl || null;
      const nextExplanation = body.next_explanation || body.nextExplanation || null;
      const nextWaktuMulai = body.next_waktu_mulai || body.nextWaktuMulai || null;
      const nextWaktuBerakhir = body.next_waktu_berakhir || body.nextWaktuBerakhir || null;
      const displayType = body.display_type || body.displayType || null;
      const galleryImages = body.gallery_images || body.galleryImages || null;

      if (!providedUrl) return NextResponse.json({ success: false, message: 'No url provided' }, { status: 400 });

      const insertObj: any = { title, url: providedUrl };
      if (explanation) insertObj.explanation = explanation;
      if (uploader) insertObj.uploader = uploader;
      if (waktuBerakhir) insertObj.waktu_berakhir = waktuBerakhir;
      if (waktuMulai) insertObj.waktu_mulai = waktuMulai;
      if (nextUrl) insertObj.next_url = nextUrl;
      if (nextExplanation) insertObj.next_explanation = nextExplanation;
      if (nextWaktuMulai) insertObj.next_waktu_mulai = nextWaktuMulai;
      if (nextWaktuBerakhir) insertObj.next_waktu_berakhir = nextWaktuBerakhir;
      if (displayType && VALID_DISPLAY_TYPES.includes(displayType)) insertObj.display_type = displayType;
      if (galleryImages) insertObj.gallery_images = galleryImages;
      if (body.slug) insertObj.slug = body.slug;
      if (body.category_id) insertObj.category_id = body.category_id;
      if (body.prioritas !== undefined) insertObj.prioritas = parseInt(body.prioritas.toString(), 10);

      const { data: insertData, error: insertError } = await supabase.from('prakiraan_images').insert(insertObj).select().single();
      if (insertError) throw insertError;
      logActivity(req.headers.get("x-auth-user"), `Menambah prakiraan: ${title}`, req);
      return NextResponse.json({ success: true, data: insertData });
    }

    // otherwise treat as multipart/form-data upload
    const form = await (req as any).formData();
    const file = form.get('file') as any;
    const nextFile = form.get('nextFile') as any;
    const title = (form.get('title') as any)?.toString() || file?.name || `prakiraan-${Date.now()}`;
    const explanation = (form.get('explanation') as any)?.toString() || null;
    const uploader = (form.get('uploader') as any)?.toString() || null;
    const waktuBerakhir = (form.get('waktu_berakhir') as any)?.toString() || (form.get('waktuBerakhir') as any)?.toString() || null;
    const waktuMulai = (form.get('waktu_mulai') as any)?.toString() || (form.get('waktuMulai') as any)?.toString() || null;
    const nextExplanation = (form.get('next_explanation') as any)?.toString() || null;
    const nextWaktuMulai = (form.get('next_waktu_mulai') as any)?.toString() || null;
    const nextWaktuBerakhir = (form.get('next_waktu_berakhir') as any)?.toString() || null;
    const displayType = (form.get('display_type') as any)?.toString() || null;
    const galleryImagesRaw = (form.get('gallery_images') as any)?.toString() || null;
    const prioritasRaw = (form.get('prioritas') as any)?.toString() || null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const publicUrl = await uploadFile('file');

    let nextPublicUrl: string | null = null;
    if (nextFile) {
      nextPublicUrl = await uploadFile('nextFile');
    }

    const slug = (form.get('slug') as any)?.toString() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const categoryId = (form.get('category_id') as any)?.toString() || null;

    const insertObj: any = { title, url: publicUrl, slug };
    if (categoryId) insertObj.category_id = categoryId;
    if (explanation) insertObj.explanation = explanation;
    if (uploader) insertObj.uploader = uploader;
    if (waktuBerakhir) insertObj.waktu_berakhir = waktuBerakhir;
    if (waktuMulai) insertObj.waktu_mulai = waktuMulai;
    if (nextPublicUrl) insertObj.next_url = nextPublicUrl;
    if (nextExplanation) insertObj.next_explanation = nextExplanation;
    if (nextWaktuMulai) insertObj.next_waktu_mulai = nextWaktuMulai;
    if (nextWaktuBerakhir) insertObj.next_waktu_berakhir = nextWaktuBerakhir;
    if (displayType && VALID_DISPLAY_TYPES.includes(displayType)) insertObj.display_type = displayType;
    if (galleryImagesRaw) {
      try { insertObj.gallery_images = JSON.parse(galleryImagesRaw); } catch {}
    }
    if (prioritasRaw) {
      insertObj.prioritas = parseInt(prioritasRaw, 10);
    }

    const { data: insertData, error: insertError } = await supabase.from('prakiraan_images').insert(insertObj).select().single();

    if (insertError) throw insertError;

    logActivity(req.headers.get("x-auth-user"), `Menambah prakiraan: ${title}`, req);

    return NextResponse.json({ success: true, data: insertData });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      console.warn("Supabase URL or service key not set");
      return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const filterExpired = searchParams.get("filterExpired") === "true";
    const activeOnly = searchParams.get("activeOnly") === "true";

    const supabase = createClient(url, serviceKey as string);

    let query = supabase.from("prakiraan_images").select(`*, category:category_id(*)`);

    const nowStr = new Date().toISOString();

    if (filterExpired || activeOnly) {
      // Show only items that are active (not expired, and scheduled time has started)
      query = query.or(`waktu_berakhir.is.null,waktu_berakhir.gt.${nowStr}`);
      // Manually filter waktu_mulai using gte to handle the combined filter
      query = query.or(`waktu_mulai.is.null,waktu_mulai.lte.${nowStr}`);
    }

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
