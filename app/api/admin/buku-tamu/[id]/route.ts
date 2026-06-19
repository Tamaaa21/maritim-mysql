import { NextResponse } from "next/server";
import { execute } from "@/lib/mysql";
import { logActivity } from "@/lib/activity-log";
import { serverError } from "@/lib/response";

export const runtime = "nodejs";

export async function DELETE(request: Request, context: any) {
  const params = (context && context.params) ? context.params : (context && typeof context === 'object' ? (context as any) : null);
  const id = params && params.id ? params.id : (typeof params?.then === 'function' ? (await params).id : undefined);
  const paramsId = id;
  try {
    await execute("DELETE FROM buku_tamu WHERE id = ?", [paramsId]);

    logActivity(request.headers.get("x-auth-user-id"), `Menghapus data buku tamu`, request.headers.get("x-auth-user-username"));
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
