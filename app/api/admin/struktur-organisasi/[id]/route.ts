import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

const jsonPath = path.join(process.cwd(), "data", "struktur_organisasi.json");

function readLocal() {
  if (!fs.existsSync(jsonPath)) return [];
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

function writeLocal(data: any) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
}

export async function PUT(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const body = await req.json();
    const { jabatan, nama, inisial, deskripsi, urutan } = body;

    if (!jabatan || !inisial) {
      return NextResponse.json({ success: false, message: "Jabatan dan inisial wajib diisi" }, { status: 400 });
    }

    if (url && serviceKey) {
      const supabase = createClient(url, serviceKey);
      const { data, error } = await supabase
        .from("struktur_organisasi")
        .update({
          jabatan,
          nama,
          inisial,
          deskripsi: deskripsi || null,
          urutan: typeof urutan === "number" ? urutan : 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (!error && data && data.length > 0) {
        logActivity(req.headers.get("x-auth-user"), `Mengubah struktur organisasi: ${jabatan}`, req);
        return NextResponse.json({ success: true, data: data[0] });
      }
      console.warn(`Failed PUT to Supabase for ID ${id}, falling back to local:`, error?.message);
    }

    // Local fallback
    const local = readLocal();
    const idx = local.findIndex((item: any) => item.id === id);
    if (idx === -1) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }

    local[idx] = {
      ...local[idx],
      jabatan,
      nama,
      inisial,
      deskripsi: deskripsi || "",
      urutan: typeof urutan === "number" ? urutan : 0,
    };
    local.sort((a: any, b: any) => (a.urutan || 0) - (b.urutan || 0));
    writeLocal(local);

    logActivity(req.headers.get("x-auth-user"), `Mengubah struktur organisasi: ${jabatan}`, req);
    return NextResponse.json({ success: true, data: local[idx] });
  } catch (error: any) {
    console.error("PUT /api/admin/struktur-organisasi/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params?.id;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
      const supabase = createClient(url, serviceKey);
      const { error } = await supabase
        .from("struktur_organisasi")
        .delete()
        .eq("id", id);

      if (!error) {
        logActivity(req.headers.get("x-auth-user"), `Menghapus struktur organisasi: ${id}`, req);
        return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
      }
      console.warn(`Failed DELETE to Supabase for ID ${id}, falling back to local:`, error.message);
    }

    // Local fallback
    const local = readLocal();
    const item = local.find((item: any) => item.id === id);
    const filtered = local.filter((item: any) => item.id !== id);
    if (local.length === filtered.length) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }
    writeLocal(filtered);

    logActivity(req.headers.get("x-auth-user"), `Menghapus struktur organisasi: ${item?.jabatan || id}`, req);
    return NextResponse.json({ success: true, message: "Data berhasil dihapus" });
  } catch (error: any) {
    console.error("DELETE /api/admin/struktur-organisasi/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
