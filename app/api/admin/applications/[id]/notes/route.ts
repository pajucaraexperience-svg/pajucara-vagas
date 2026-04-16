import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  return data ? user : null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await ensureAdmin();
  if (!user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const { body } = (await req.json()) as { body?: string };
  if (!body?.trim())
    return NextResponse.json({ message: "Observação vazia" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase.from("application_notes").insert({
    application_id: id,
    author_id: user.id,
    body: body.trim(),
  });
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}
