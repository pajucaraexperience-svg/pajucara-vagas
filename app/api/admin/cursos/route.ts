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

export async function POST(req: NextRequest) {
  const user = await ensureAdmin();
  if (!user) return NextResponse.json({ message: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: body.title,
      slug: body.slug,
      summary: body.summary || null,
      description: body.description || null,
      highlights: body.highlights ?? [],
      location: body.location || null,
      schedule: body.schedule || null,
      capacity: body.capacity ?? null,
      status: body.status ?? "draft",
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
