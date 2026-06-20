import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
]);
const CONVERTIBLE_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/bmp", "image/tiff",
]);

export interface UploadResult {
  url: string;
  path: string;
}

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileValidationError";
  }
}

export function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(`File terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new FileValidationError(`Tipe file tidak diizinkan: ${file.type}`);
  }
}

export async function uploadFile(
  file: File,
  folder: string = "uploads"
): Promise<UploadResult> {
  validateFile(file);

  let arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer);
  let ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  let contentType = file.type;

  if (CONVERTIBLE_MIME_TYPES.has(contentType)) {
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
