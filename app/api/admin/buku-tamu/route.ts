import { NextRequest } from "next/server";
import { getAllBukuTamu, deleteBukuTamu, deleteAllBukuTamu } from "@/services/buku-tamu.service";
import { getUserId, getUsername, isAdmin } from "@/services/admin.service";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, serverError } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getAllBukuTamu();
    return ok(rows);
  } catch (error) {
    console.error(error);
    return serverError(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
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
      await deleteBukuTamu(ids);
      logActivity(getUserId(request), `Menghapus ${ids.length} data buku tamu`, getUsername(request));
      return ok(null, "Data terpilih berhasil dihapus");
    } else {
      await deleteAllBukuTamu();
      logActivity(getUserId(request), "Menghapus semua data buku tamu", getUsername(request));
      return ok(null, "Semua data berhasil dihapus");
    }
  } catch (error) {
    console.error(error);
    return serverError(error);
  }
}
