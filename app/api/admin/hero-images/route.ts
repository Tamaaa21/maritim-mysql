import { uploadFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity-log";
import { query, execute } from "@/lib/mysql";
import { okCached, ok, badRequest, serverError } from "@/lib/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const name = form.get("name")?.toString() || file?.name || `hero-${Date.now()}`;
    const orderIndex = form.get("order") ? parseInt(form.get("order")!.toString(), 10) : 0;

    if (!file) return badRequest("No file provided");

    const { url } = await uploadFile(file, "hero");

    const id = crypto.randomUUID();
    await execute(
      "INSERT INTO hero_images (id, name, url, order_index) VALUES (?, ?, ?, ?)",
      [id, name, url, orderIndex]
    );

    const [data] = await query("SELECT * FROM hero_images WHERE id = ?", [id]);

    logActivity(
      req.headers.get("x-auth-user-id"),
      `Menambah hero slider: ${name}`,
      req.headers.get("x-auth-user-username")
    );

    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

export async function GET() {
  try {
    const data = await query("SELECT * FROM hero_images ORDER BY order_index ASC");
    return okCached(data);
  } catch (error) {
    return serverError(error);
  }
}
