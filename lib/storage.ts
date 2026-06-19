import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export interface UploadResult {
  url: string;
  path: string;
}

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/bmp", "image/tiff", "image/webp"];

function isConvertibleImage(mimeType: string): boolean {
  return IMAGE_MIME_TYPES.includes(mimeType);
}

export async function uploadFile(
  file: File,
  folder: string = "uploads"
): Promise<UploadResult> {
  let arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  let ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  let contentType = file.type;

  if (isConvertibleImage(contentType)) {
    try {
      buffer = await sharp(buffer)
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
      ext = "webp";
      contentType = "image/webp";
    } catch (e) {
      console.error("WebP conversion failed, using original:", e);
    }
  }

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const relativePath = `${folder}/${filename}`;
  const fullPath = path.join(UPLOAD_DIR, relativePath);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);

  const url = `/uploads/${relativePath}`;

  return { url, path: relativePath };
}

export async function uploadMultipleFiles(
  files: File[],
  folder: string = "uploads"
): Promise<UploadResult[]> {
  return Promise.all(files.map((f) => uploadFile(f, folder)));
}

export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  try {
    await fs.unlink(fullPath);
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error("Failed to delete file:", error);
    }
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}
