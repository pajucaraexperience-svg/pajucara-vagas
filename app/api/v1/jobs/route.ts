import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkApiKey } from "@/lib/api-auth";

const jobSchema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  sector: z.string().optional(),
  location: z.string().optional(),
  schedule: z.string().optional(),
  summary: z.string().optional(),
  activities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  desirables: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  status: z.enum(["draft", "active", "paused", "closed"]).default("draft"),
});

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const denied = checkApiKey(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Body JSON inválido" }, { status: 400 });
  }

  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const baseSlug = d.slug ?? toSlug(d.title);
  const supabase = createAdminClient();

  // Garante slug único acrescentando sufixo numérico se necessário
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const { data: existing } = await supabase
      .from("jobs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title: d.title,
      slug,
      sector: d.sector ?? null,
      location: d.location ?? null,
      schedule: d.schedule ?? null,
      summary: d.summary ?? null,
      activities: d.activities,
      requirements: d.requirements,
      desirables: d.desirables,
      benefits: d.benefits,
      status: d.status,
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, slug: data.slug }, { status: 201 });
}
