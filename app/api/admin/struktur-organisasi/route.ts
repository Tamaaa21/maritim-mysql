import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

const jsonPath = path.join(process.cwd(), "data", "struktur_organisasi.json");

const defaultData = [
  { id: "1", jabatan: "Kepala Stasiun", nama: "Drs. Nama Kepala", inisial: "K", deskripsi: "Pimpinan UPT", urutan: 1 },
  { id: "2", jabatan: "Seksi Observasi", nama: "Kepala Seksi Observasi", inisial: "O", deskripsi: "Melakukan pengamatan, perekaman data cuaca maritim & instrumen meteorologi", urutan: 2 },
  { id: "3", jabatan: "Seksi Data & Informasi", nama: "Kepala Seksi Data", inisial: "D", deskripsi: "Mengolah database, analisis klimatologi, dan penyebaran informasi cuaca", urutan: 3 },
  { id: "4", jabatan: "Seksi Pelayanan", nama: "Kepala Seksi Pelayanan", inisial: "P", deskripsi: "Pelayanan jasa meteorologi, edukasi publik, dan hubungan kemitraan maritim", urutan: 4 }
];

function readLocal() {
  if (!fs.existsSync(jsonPath)) {
    const dataDir = path.dirname(jsonPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(jsonPath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(jsonPath, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return defaultData;
  }
}

function writeLocal(data: any) {
  const dataDir = path.dirname(jsonPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json({ success: true, data: readLocal() });
    }

    const supabase = createClient(url, serviceKey);
    const { data, error } = await supabase
      .from("struktur_organisasi")
      .select("*")
      .order("urutan", { ascending: true });

    if (error) {
      console.warn("Table 'struktur_organisasi' missing or error, using local JSON:", error.message);
      return NextResponse.json({ success: true, data: readLocal() });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error("GET /api/admin/struktur-organisasi error:", error);
    return NextResponse.json({ success: true, data: readLocal() });
  }
}

export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const body = await req.json();
    const { jabatan, nama, inisial, deskripsi, urutan } = body;

    if (!jabatan || !inisial) {
      return NextResponse.json({ success: false, message: "Jabatan dan inisial wajib diisi" }, { status: 400 });
    }

    // Attempt to write to Supabase
    if (url && serviceKey) {
      const supabase = createClient(url, serviceKey);
      const { data, error } = await supabase
        .from("struktur_organisasi")
        .insert({
          jabatan,
          nama,
          inisial,
          deskripsi: deskripsi || null,
          urutan: typeof urutan === "number" ? urutan : 0,
        })
        .select()
        .single();

      if (!error) {
        logActivity(req.headers.get("x-auth-user"), `Menambah struktur organisasi: ${jabatan}`, req);
        return NextResponse.json({ success: true, data });
      }
      console.warn("Failed posting to Supabase struktur_organisasi, falling back to local:", error.message);
    }

    // Fallback to local
    const local = readLocal();
    const newEntry = {
      id: String(Date.now()),
      jabatan,
      nama,
      inisial,
      deskripsi: deskripsi || "",
      urutan: typeof urutan === "number" ? urutan : 0,
    };
    local.push(newEntry);
    local.sort((a: any, b: any) => (a.urutan || 0) - (b.urutan || 0));
    writeLocal(local);

    logActivity(req.headers.get("x-auth-user"), `Menambah struktur organisasi: ${jabatan}`, req);
    return NextResponse.json({ success: true, data: newEntry });
  } catch (error: any) {
    console.error("POST /api/admin/struktur-organisasi error:", error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
