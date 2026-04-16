import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const payloadSchema = z.object({
  job_id: z.string().uuid().nullable(),
  is_talent_pool: z.boolean(),
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
  professional: z.object({
    education: z.string().min(1),
    last_role: z.string().nullable(),
    interest_area: z.string().nullable(),
    experience_years: z.string().min(1),
    start_availability: z.string().min(1),
    schedule_availability: z.string().min(1),
    salary_expectation: z.string().nullable(),
    hotel_experience: z.boolean(),
    hotel_experience_detail: z.string().nullable(),
    customer_service_experience: z.boolean(),
    languages: z.array(z.object({ name: z.string(), level: z.string() })),
    computer_skills: z.array(z.object({ tool: z.string(), level: z.string() })),
  }),
  resume_url: z.string().min(1),
  resume_name: z.string().min(1),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })),
  consents: z.object({
    truthfulness_accepted: z.literal(true),
    lgpd_accepted: z.literal(true),
  }),
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      question_label: z.string(),
      question_scope: z.enum(["general", "role"]),
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

    const { data: app, error: insertError } = await supabase
      .from("applications")
      .insert({
        job_id: p.job_id,
        is_talent_pool: p.is_talent_pool,
        full_name: p.personal.full_name,
        birth_date: p.personal.birth_date,
        cpf: p.personal.cpf,
        phone_whatsapp: p.personal.phone_whatsapp,
        email: p.personal.email,
        city: p.personal.city,
        state: p.personal.state,
        address: p.personal.address,
        linkedin_url: p.personal.linkedin_url,
        education: p.professional.education,
        last_role: p.professional.last_role,
        interest_area: p.professional.interest_area,
        experience_years: p.professional.experience_years,
        start_availability: p.professional.start_availability,
        schedule_availability: p.professional.schedule_availability,
        salary_expectation: p.professional.salary_expectation,
        hotel_experience: p.professional.hotel_experience,
        hotel_experience_detail: p.professional.hotel_experience_detail,
        customer_service_experience: p.professional.customer_service_experience,
        languages: p.professional.languages,
        computer_skills: p.professional.computer_skills,
        resume_url: p.resume_url,
        attachments: p.attachments,
        truthfulness_accepted: p.consents.truthfulness_accepted,
        lgpd_accepted: p.consents.lgpd_accepted,
        stage: p.is_talent_pool ? "talent_pool" : "received",
      })
      .select("id")
      .single();

    if (insertError || !app) {
      return NextResponse.json(
        { message: insertError?.message ?? "Falha ao salvar candidatura" },
        { status: 500 },
      );
    }

    if (p.answers.length > 0) {
      const rows = p.answers.map((a) => ({
        application_id: app.id,
        question_id: a.question_id,
        question_label: a.question_label,
        question_scope: a.question_scope,
        value: a.value,
      }));
      const { error: ansError } = await supabase
        .from("application_answers")
        .insert(rows);
      if (ansError) {
        return NextResponse.json(
          { message: `Candidatura salva, mas falha nas respostas: ${ansError.message}` },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ id: app.id }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
