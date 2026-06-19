import { query } from "@/lib/mysql";
import { okCached, serverError } from "@/lib/response";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const data = await query("SELECT * FROM publications ORDER BY created_at DESC");
    return okCached(data || []);
  } catch (error) {
    return serverError(error);
  }
}
