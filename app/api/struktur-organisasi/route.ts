import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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
      console.warn("Table 'struktur_organisasi' missing, using local JSON fallback:", error.message);
      return NextResponse.json({ success: true, data: readLocal() });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error("GET /api/struktur-organisasi error:", error);
    return NextResponse.json({ success: true, data: readLocal() });
  }
}
