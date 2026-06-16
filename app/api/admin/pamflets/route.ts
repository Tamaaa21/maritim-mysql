import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { logActivity } from "@/lib/activity-log";

const DATA_FILE = path.join(process.cwd(), 'data', 'pamflets.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'pamflets');

function ensureStorage() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET() {
  ensureStorage();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  let list = JSON.parse(raw || '[]');
  // sort list by order (ascending)
  list.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  return new Response(JSON.stringify({ success: true, data: list }), { status: 200 });
}

export async function POST(req: NextRequest) {
  ensureStorage();
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const url = form.get('url')?.toString() || null;
    const uploader = form.get('uploader')?.toString() || null;
    const title = form.get('title')?.toString() || '';

    let storedUrl = url;
    if (file && (file as any).size) {
      const buf = Buffer.from(await (file as any).arrayBuffer());
      const filename = `pamflet-${Date.now()}-${String((file as any).name || 'upload')}`.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const outPath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(outPath, buf);
      storedUrl = `/uploads/pamflets/${filename}`;
    }

    if (!storedUrl) return new Response(JSON.stringify({ success: false, error: 'No file or url provided' }), { status: 400 });

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const list = JSON.parse(raw || '[]');
    const id = Date.now().toString();
    const item: any = { id, url: storedUrl, title, order: list.length + 1 };
    if (uploader) item.uploader = uploader;
    list.push(item);
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
    logActivity(req.headers.get("x-auth-user"), `Menambah pamflet: ${title}`, req);
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
  // delete file if local
  try {
    if (removed.url && removed.url.startsWith('/uploads/pamflets/')) {
      const fp = path.join(process.cwd(), 'public', removed.url.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  } catch (e) {
    // ignore
  }
  // reassign order
  list = list.map((it: any, i: number) => ({ ...it, order: i + 1 }));
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
  logActivity(req.headers.get("x-auth-user"), `Menghapus pamflet: ${removed?.title || id}`, req);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function PATCH(req: NextRequest) {
  ensureStorage();
  try {
    const body = await req.json();

    // Support bulk reordering for drag and drop
    if (body.items && Array.isArray(body.items)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      let list = JSON.parse(raw || '[]');

      // Reorder items based on the array of IDs sent
      const newOrderedList: any[] = [];
      body.items.forEach((id: string) => {
        const found = list.find((it: any) => it.id === id);
        if (found) {
          newOrderedList.push(found);
        }
      });

      // Keep any items that were not included in the payload (failsafe)
      list.forEach((it: any) => {
        if (!newOrderedList.some((n: any) => n.id === it.id)) {
          newOrderedList.push(it);
        }
      });

      // Re-assign sequential order
      const updatedList = newOrderedList.map((it: any, i: number) => ({ ...it, order: i + 1 }));

      fs.writeFileSync(DATA_FILE, JSON.stringify(updatedList, null, 2));
      logActivity(req.headers.get("x-auth-user"), `Mengurutkan ulang pamflet`, req);
      return new Response(JSON.stringify({ success: true, data: updatedList }), { status: 200 });
    }

    const { id, direction } = body;
    if (!id || !direction) {
      return new Response(JSON.stringify({ success: false, error: 'id and direction are required' }), { status: 400 });
    }
    if (direction !== 'up' && direction !== 'down') {
      return new Response(JSON.stringify({ success: false, error: 'direction must be up or down' }), { status: 400 });
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    let list = JSON.parse(raw || '[]');
    // Ensure all items have an order, then sort
    list = list.map((it: any, i: number) => ({ ...it, order: it.order ?? (i + 1) }));
    list.sort((a: any, b: any) => a.order - b.order);

    const idx = list.findIndex((i: any) => i.id === id);
    if (idx === -1) {
      return new Response(JSON.stringify({ success: false, error: 'not found' }), { status: 404 });
    }

    if (direction === 'up') {
      if (idx > 0) {
        const temp = list[idx];
        list[idx] = list[idx - 1];
        list[idx - 1] = temp;
      }
    } else if (direction === 'down') {
      if (idx < list.length - 1) {
        const temp = list[idx];
        list[idx] = list[idx + 1];
        list[idx + 1] = temp;
      }
    }

    // re-assign order sequentially
    list = list.map((it: any, i: number) => ({ ...it, order: i + 1 }));

    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
    logActivity(req.headers.get("x-auth-user"), `Memindahkan pamflet: ${direction === 'up' ? 'naik' : 'turun'}`, req);
    return new Response(JSON.stringify({ success: true, data: list }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
}

export const runtime = 'nodejs';
