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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await ensureAdmin();
  if (!user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: app } = await supabase
    .from("applications")
    .select("resume_url")
    .eq("id", id)
    .maybeSingle();
  if (!app?.resume_url)
    return NextResponse.json({ message: "Sem currículo" }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(app.resume_url as string, 60 * 5);
  if (error || !data)
    return NextResponse.json({ message: "Falha ao gerar link" }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}
