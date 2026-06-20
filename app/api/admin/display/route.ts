import crypto from "node:crypto";
import { db, schema } from "@/db";
import { eq, asc, desc } from "drizzle-orm";
import { uploadFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import { displaySchema } from "@/lib/validation";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.select().from(schema.display_slides).orderBy(asc(schema.display_slides.order));
    return ok(rows);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const url = form.get("url")?.toString() || null;
    const uploader = req.headers.get("x-auth-user-username") || form.get("uploader")?.toString() || null;
    const title = form.get("title")?.toString() || "";
    const waktu_berakhir = form.get("waktu_berakhir")?.toString() || null;

    let storedUrl = url;
    if (file && file.size) {
      const result = await uploadFile(file, "display");
      storedUrl = result.url;
    }

    if (!storedUrl) return badRequest("No file or url provided");

    const existing = await db.select({ order: schema.display_slides.order })
      .from(schema.display_slides)
      .orderBy(desc(schema.display_slides.order))
      .limit(1);
    const nextOrder = (existing.length > 0 ? existing[0].order : 0) + 1;

    const id = crypto.randomUUID() as string;
    await db.insert(schema.display_slides).values({
      id,
      title,
      url: storedUrl,
      order: nextOrder,
      uploader: uploader as string | null | undefined,
      waktu_berakhir: waktu_berakhir as any,
    });

    const rows = await db.select().from(schema.display_slides).where(eq(schema.display_slides.id, id));
    const data = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Menambah display: ${title}`, req.headers.get("x-auth-user-username"));
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequest("id required");

    const rows = await db.select().from(schema.display_slides).where(eq(schema.display_slides.id, id));
    const data = rows[0];
    if (!data) return notFound();

    await db.delete(schema.display_slides).where(eq(schema.display_slides.id, id));

    const remaining = await db.select().from(schema.display_slides).orderBy(asc(schema.display_slides.order));

    if (remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        await db.update(schema.display_slides)
          .set({ order: i + 1 })
          .where(eq(schema.display_slides.id, remaining[i].id));
      }
    }

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus display: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const parsed = displaySchema.partial().safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(", "));
    }

    if (body.items && Array.isArray(body.items)) {
      const allItems = await db.select().from(schema.display_slides);

      const newOrderedList: any[] = [];
      body.items.forEach((id: string) => {
        const found = allItems.find((it: any) => it.id === id);
        if (found) newOrderedList.push(found);
      });
      allItems.forEach((it: any) => {
        if (!newOrderedList.some((n: any) => n.id === it.id)) {
          newOrderedList.push(it);
        }
      });

      for (let i = 0; i < newOrderedList.length; i++) {
        await db.update(schema.display_slides)
          .set({ order: i + 1 })
          .where(eq(schema.display_slides.id, newOrderedList[i].id));
      }

      logActivity(req.headers.get("x-auth-user-id"), "Mengurutkan ulang display", req.headers.get("x-auth-user-username"));
      const updated = await db.select().from(schema.display_slides).orderBy(asc(schema.display_slides.order));
      return ok(updated);
    }

    const { id, direction } = body;
    if (!id || !direction) {
      return badRequest("id and direction are required");
    }
    if (direction !== "up" && direction !== "down") {
      return badRequest("direction must be up or down");
    }

    const items = await db.select().from(schema.display_slides).orderBy(asc(schema.display_slides.order));

    const idx = items.findIndex((i: any) => i.id === id);
    if (idx === -1) return notFound();

    if (direction === "up" && idx > 0) {
      const temp = items[idx];
      items[idx] = items[idx - 1];
      items[idx - 1] = temp;
    } else if (direction === "down" && idx < items.length - 1) {
      const temp = items[idx];
      items[idx] = items[idx + 1];
      items[idx + 1] = temp;
    }

    for (let i = 0; i < items.length; i++) {
      await db.update(schema.display_slides)
        .set({ order: i + 1 })
        .where(eq(schema.display_slides.id, items[i].id));
    }

    logActivity(req.headers.get("x-auth-user-id"), `Memindahkan display: ${direction === "up" ? "naik" : "turun"}`, req.headers.get("x-auth-user-username"));
    const finalList = await db.select().from(schema.display_slides).orderBy(asc(schema.display_slides.order));
    return ok(finalList);
  } catch (error) {
    return serverError(error);
  }
}
