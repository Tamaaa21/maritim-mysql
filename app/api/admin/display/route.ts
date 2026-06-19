import crypto from "node:crypto";
import { query, execute } from "@/lib/mysql";
import { uploadFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { ok, badRequest, notFound, serverError } from "@/lib/response";
import type { DisplaySlide } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await query<any>(
      "SELECT * FROM display ORDER BY `order` ASC"
    );
    return ok(rows as DisplaySlide[]);
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

    const existing = await query<any>(
      "SELECT `order` FROM display ORDER BY `order` DESC LIMIT 1"
    );
    const nextOrder = (existing.length > 0 ? existing[0].order : 0) + 1;

    const id = crypto.randomUUID();
    await execute(
      "INSERT INTO display (id, title, url, `order`, uploader, waktu_berakhir) VALUES (?, ?, ?, ?, ?, ?)",
      [id, title, storedUrl, nextOrder, uploader, waktu_berakhir]
    );

    const rows = await query<any>(
      "SELECT * FROM display WHERE id = ?",
      [id]
    );
    const data = rows[0];

    logActivity(req.headers.get("x-auth-user-id"), `Menambah display: ${title}`, req.headers.get("x-auth-user-username"));
    return ok(data as DisplaySlide);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return badRequest("id required");

    const rows = await query<any>(
      "SELECT * FROM display WHERE id = ?",
      [id]
    );
    const data = rows[0];
    if (!data) return notFound();

    await execute("DELETE FROM display WHERE id = ?", [id]);

    const remaining = await query<any>(
      "SELECT * FROM display ORDER BY `order` ASC"
    );

    if (remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        await execute(
          "UPDATE display SET `order` = ? WHERE id = ?",
          [i + 1, remaining[i].id]
        );
      }
    }

    logActivity(req.headers.get("x-auth-user-id"), `Menghapus display: ${data?.title || id}`, req.headers.get("x-auth-user-username"));
    return ok(data as DisplaySlide);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    if (body.items && Array.isArray(body.items)) {
      const allItems = await query<any>("SELECT * FROM display");

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
        await execute(
          "UPDATE display SET `order` = ? WHERE id = ?",
          [i + 1, newOrderedList[i].id]
        );
      }

      logActivity(req.headers.get("x-auth-user-id"), "Mengurutkan ulang display", req.headers.get("x-auth-user-username"));
      const updated = await query<any>(
        "SELECT * FROM display ORDER BY `order` ASC"
      );
      return ok(updated as DisplaySlide[]);
    }

    const { id, direction } = body;
    if (!id || !direction) {
      return badRequest("id and direction are required");
    }
    if (direction !== "up" && direction !== "down") {
      return badRequest("direction must be up or down");
    }

    const items = await query<any>(
      "SELECT * FROM display ORDER BY `order` ASC"
    );

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
      await execute(
        "UPDATE display SET `order` = ? WHERE id = ?",
        [i + 1, items[i].id]
      );
    }

    logActivity(req.headers.get("x-auth-user-id"), `Memindahkan display: ${direction === "up" ? "naik" : "turun"}`, req.headers.get("x-auth-user-username"));
    const finalList = await query<any>(
      "SELECT * FROM display ORDER BY `order` ASC"
    );
    return ok(finalList as DisplaySlide[]);
  } catch (error) {
    return serverError(error);
  }
}
