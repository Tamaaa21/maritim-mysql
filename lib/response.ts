import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";

export function ok<T>(data: T, message?: string, cacheMaxAge?: number) {
  const headers: Record<string, string> = {};
  if (cacheMaxAge) {
    headers["Cache-Control"] = `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=${cacheMaxAge * 2}`;
  }
  return NextResponse.json({ success: true, data, message }, { status: 200, headers });
}

export function okCached<T>(data: T, message?: string) {
  return ok(data, message, 60);
}

export function created<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function badRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export function notFound(message = "Data tidak ditemukan") {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function conflict(message: string) {
  return NextResponse.json({ success: false, message }, { status: 409 });
}

export function serverError(error?: unknown) {
  console.error("[Server Error]", error);
  try {
    writeFileSync(join("/tmp", "latest_error.log"), JSON.stringify({ error: error instanceof Error ? error.stack : error }, null, 2));
  } catch { /* ignore file write errors */ }
  return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
}

export function paginated<T>(data: T[], total: number, page: number, perPage: number) {
  return NextResponse.json({
    success: true,
    data,
    pagination: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  }, { status: 200 });
}
