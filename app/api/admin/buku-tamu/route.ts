import { NextRequest } from "next/server";
import crypto from "crypto";
import { query, execute } from "@/lib/mysql";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, serverError } from "@/lib/response";
import type { BukuTamu } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getUserId(request: NextRequest) {
  return request.headers.get("x-auth-user-id") || "";
}

function getUsername(request: NextRequest) {
  return request.headers.get("x-auth-user-username") || "";
}

function getRole(request: NextRequest) {
  return request.headers.get("x-auth-user-role") || "";
}

export async function GET() {
  try {
    const rows = await query("SELECT * FROM buku_tamu ORDER BY created_at DESC");
    return ok(rows as BukuTamu[]);
  } catch (error) {
    console.error(error);
    return serverError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const role = getRole(request);
  if (role !== "super_admin" && role !== "admin") {
    return badRequest("Forbidden");
  }

  try {
    let ids: string[] = [];

    try {
      const body = await request.json();
      if (body.ids && Array.isArray(body.ids)) {
        ids = body.ids;
      }
    } catch {
      // no body = delete all
    }

    if (ids.length > 0) {
      await execute("DELETE FROM buku_tamu WHERE id IN (?)", [ids]);
      logActivity(getUserId(request), `Menghapus ${ids.length} data buku tamu`, getUsername(request));
      return ok(null, "Data terpilih berhasil dihapus");
    } else {
      await execute("DELETE FROM buku_tamu WHERE id IS NOT NULL");
      logActivity(getUserId(request), "Menghapus semua data buku tamu", getUsername(request));
      return ok(null, "Semua data berhasil dihapus");
    }
  } catch (error: any) {
    console.error(error);
    return serverError(error);
  }
}
