import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity-log";

export const runtime = "nodejs";

async function getId(req: Request, context: any) {
  try {
    const params = await context.params;
    return params?.id || new URL(req.url).pathname.split('/').pop();
  } catch {
    return undefined;
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const id = await getId(req, context);
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const body = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const updateData: any = {};
    if (body.nama !== undefined) updateData.nama = body.nama;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
      }
      updateData.password = await hashPassword(body.password);
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, username, role, nama, is_active, created_at")
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user"), `Mengubah pengguna: ${data?.username || id}`, req);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const id = await getId(req, context);
    if (!id) return NextResponse.json({ success: false, message: "Invalid id" }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    logActivity(req.headers.get("x-auth-user"), `Menghapus pengguna: ${data?.username || id}`, req);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 });
  }
}
