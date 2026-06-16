import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logActivity } from "@/lib/activity-log";

const DATA_FILE = path.join(process.cwd(), 'data', 'publications.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'publications');

function ensureStorage() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET() {
  ensureStorage();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const list = JSON.parse(raw || '[]');
  return new Response(JSON.stringify({ success: true, data: list }), { status: 200 });
}

export async function POST(req: NextRequest) {
  ensureStorage();
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const coverFile = form.get('coverFile') as File | null;
    const url = form.get('url')?.toString() || null;
    const coverUrl = form.get('coverUrl')?.toString() || null;
    const title = form.get('title')?.toString() || '';
    const description = form.get('description')?.toString() || '';
    const uploader = form.get('uploader')?.toString() || null;

    let storedUrl = url;
    if (file && (file as any).size) {
      const buf = Buffer.from(await (file as any).arrayBuffer());
      const filename = `publication-${Date.now()}-${String((file as any).name || 'upload')}`.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const outPath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(outPath, buf);
      storedUrl = `/uploads/publications/${filename}`;
    }

    let storedCoverUrl = coverUrl || null;
    if (coverFile && (coverFile as any).size) {
      const buf = Buffer.from(await (coverFile as any).arrayBuffer());
      const filename = `cover-${Date.now()}-${String((coverFile as any).name || 'cover')}`.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const outPath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(outPath, buf);
      storedCoverUrl = `/uploads/publications/${filename}`;
    }

    if (!storedUrl) return new Response(JSON.stringify({ success: false, error: 'No file or url provided' }), { status: 400 });

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const list = JSON.parse(raw || '[]');
    const id = Date.now().toString();
    const item: any = { 
      id, 
      url: storedUrl, 
      cover_url: storedCoverUrl, 
      title, 
      description, 
      order: list.length + 1, 
      created_at: new Date().toISOString() 
    };
    if (uploader) item.uploader = uploader;
    list.push(item);
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
    logActivity(req.headers.get("x-auth-user"), `Menambah publikasi: ${title}`, req);
    return new Response(JSON.stringify({ success: true, data: item }), { status: 201 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  ensureStorage();
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return new Response(JSON.stringify({ success: false, error: 'id required' }), { status: 400 });
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  let list = JSON.parse(raw || '[]');
  const idx = list.findIndex((i: any) => i.id === id);
  if (idx === -1) return new Response(JSON.stringify({ success: false, error: 'not found' }), { status: 404 });
  const [removed] = list.splice(idx, 1);
  try {
    if (removed.url && removed.url.startsWith('/uploads/publications/')) {
      const fp = path.join(process.cwd(), 'public', removed.url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    if (removed.cover_url && removed.cover_url.startsWith('/uploads/publications/')) {
      const fp = path.join(process.cwd(), 'public', removed.cover_url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  } catch (e) {}
  list = list.map((it: any, i: number) => ({ ...it, order: i + 1 }));
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
  logActivity(req.headers.get("x-auth-user"), `Menghapus publikasi: ${removed?.title || id}`, req);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export const runtime = 'nodejs';
