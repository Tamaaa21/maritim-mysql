import { NextResponse } from "next/server";
import { submitBukuTamu } from "@/services/buku-tamu.service";
import { bukuTamuSubmitSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const rateCheck = checkRateLimit(`buku-tamu:${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: false, message: "Terlalu banyak permintaan. Silakan coba lagi nanti." }, { status: 429 });
    }

    const data = await request.json();
    const parsed = bukuTamuSubmitSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }
    await submitBukuTamu(parsed.data);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Gagal mengirim data" }, { status: 500 });
  }
}
