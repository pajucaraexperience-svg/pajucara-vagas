import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const payloadSchema = z.object({
  course_slug: z.string().min(1),
  personal: z.object({
    full_name: z.string().min(3),
    birth_date: z.string().min(1),
    cpf: z.string().min(11),
    phone_whatsapp: z.string().min(10),
    email: z.string().email(),
    city: z.string().min(2),
    state: z.string().length(2),
    address: z.string().nullable(),
    linkedin_url: z.string().nullable(),
  }),
  resume: z
    .object({ name: z.string(), url: z.string() })
    .nullable()
    .default(null),
  lgpd_accepted: z.literal(true),
  answers: z.array(
    z.object({
      question_label: z.string(),
      value: z.unknown(),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Dados inválidos", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const p = parsed.data;
    const supabase = createAdminClient();

    // Carrega o curso e exige que esteja ativo.
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, capacity, status")
      .eq("slug", p.course_slug)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json({ message: "Curso não encontrado" }, { status: 404 });
    }
    if (course.status !== "active") {
      return NextResponse.json(
        { message: "As inscrições para este curso não estão abertas." },
        { status: 409 },
      );
    }

    // Lista de espera: se já atingiu a capacidade, a inscrição entra como espera.
    const { count } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course.id);

    const waitlist =
      course.capacity != null && (count ?? 0) >= course.capacity;

    const { data: app, error: insertError } = await supabase
      .from("applications")
      .insert({
        course_id: course.id,
        is_talent_pool: false,
        full_name: p.personal.full_name,
        birth_date: p.personal.birth_date,
        cpf: p.personal.cpf,
        phone_whatsapp: p.personal.phone_whatsapp,
        email: p.personal.email,
        city: p.personal.city,
        state: p.personal.state,
        address: p.personal.address,
        linkedin_url: p.personal.linkedin_url,
        resume_url: p.resume?.url ?? null,
        attachments: p.resume ? [p.resume] : [],
        lgpd_accepted: p.lgpd_accepted,
        stage: "received",
      })
      .select("id")
      .single();

    if (insertError || !app) {
      return NextResponse.json(
        { message: insertError?.message ?? "Falha ao salvar inscrição" },
        { status: 500 },
      );
    }

    if (p.answers.length > 0) {
      const rows = p.answers.map((a) => ({
        application_id: app.id,
        question_id: null,
        question_label: a.question_label,
        question_scope: "general" as const,
        value: a.value,
      }));
      const { error: ansError } = await supabase
        .from("application_answers")
        .insert(rows);
      if (ansError) {
        return NextResponse.json(
          { message: `Inscrição salva, mas falha nas respostas: ${ansError.message}` },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ id: app.id, waitlist }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
