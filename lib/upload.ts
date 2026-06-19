import sharp from 'sharp';
import { getSupabaseAdmin } from "./supabaseAdmin";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "public";

export interface UploadResult {
  url: string;
  path: string;
}

async function ensureBucket(supabase: any) {
  try {
    await supabase.storage.createBucket(BUCKET, { public: true });
  } catch {
    // bucket already exists
  }
}

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];

function isConvertibleImage(mimeType: string): boolean {
  return IMAGE_MIME_TYPES.includes(mimeType);
}

export async function uploadFile(
  file: File,
  folder: string = "uploads"
): Promise<UploadResult> {
  const supabase: any = getSupabaseAdmin();

  let arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  let ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  let contentType = file.type;

  if (isConvertibleImage(contentType)) {
    try {
      buffer = await sharp(buffer)
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
      ext = 'webp';
      contentType = 'image/webp';
    } catch (e) {
      console.error('WebP conversion failed, using original:', e);
    }
  }

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder}/${filename}`;

  let { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (uploadError) {
    await ensureBucket(supabase);
    const retry = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType, upsert: true });
    uploadData = retry.data;
    uploadError = retry.error;
  }

  if (uploadError) throw new Error(`Upload gagal: ${uploadError.message}`);
  if (!uploadData?.path) throw new Error("Upload gagal: tidak ada path");

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
  const publicUrl = (urlData as any)?.publicUrl || "";

  return { url: publicUrl, path: uploadData.path };
}

export async function uploadMultipleFiles(
  files: File[],
  folder: string = "uploads"
): Promise<UploadResult[]> {
  return Promise.all(files.map((f) => uploadFile(f, folder)));
}
