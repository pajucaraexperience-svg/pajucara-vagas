import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STAGES = [
  "received","screening","preselected","interview_scheduled",
  "interviewed","approved","rejected","talent_pool",
];

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await ensureAdmin();
  if (!user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  if (body.stage && !STAGES.includes(body.stage)) {
    return NextResponse.json({ message: "Etapa inválida" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (body.stage) update.stage = body.stage;

  const supabase = createAdminClient();
  const { error } = await supabase.from("applications").update(update).eq("id", id);
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
