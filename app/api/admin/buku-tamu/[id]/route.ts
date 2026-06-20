import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db, schema } from "@/db";
import { eq } from "drizzle-orm";
import { logActivity } from "@/lib/activity-log";
import { serverError } from "@/lib/response";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await db.delete(schema.buku_tamu).where(eq(schema.buku_tamu.id, id));

    logActivity(request.headers.get("x-auth-user-id"), `Menghapus data buku tamu`, request.headers.get("x-auth-user-username"));
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError(error);
  }
}
