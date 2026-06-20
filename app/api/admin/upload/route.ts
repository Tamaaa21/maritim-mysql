import { NextResponse } from "next/server";
import { uploadFile, FileValidationError } from "@/lib/storage";
import { badRequest, serverError } from "@/lib/response";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return badRequest("No file provided");

    const result = await uploadFile(file, "uploads");

    return NextResponse.json({ success: true, url: result.url, path: result.path });
  } catch (error) {
    if (error instanceof FileValidationError) {
      return badRequest(error.message);
    }
    return serverError();
  }
}
