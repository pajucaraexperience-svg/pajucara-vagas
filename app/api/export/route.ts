import { NextRequest } from "next/server";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { stageLabels } from "@/lib/content/messages";

export const runtime = "nodejs";

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  return data ? { user, supabase } : null;
}

export async function GET(req: NextRequest) {
  const ctx = await ensureAdmin();
  if (!ctx) return new Response("Não autorizado", { status: 401 });
  const { supabase } = ctx;

  const url = new URL(req.url);
  const job = url.searchParams.get("job");
  const stage = url.searchParams.get("stage");
  const city = url.searchParams.get("city");
  const hotel = url.searchParams.get("hotel");
  const q = url.searchParams.get("q");

  let query = supabase
    .from("applications")
    .select(
      "id, full_name, email, phone_whatsapp, cpf, birth_date, city, state, address, education, last_role, interest_area, experience_years, start_availability, schedule_availability, salary_expectation, hotel_experience, customer_service_experience, stage, created_at, job:jobs(title)",
    )
    .order("created_at", { ascending: false });

  if (q)
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,cpf.ilike.%${q}%`);
  if (job) query = query.eq("job_id", job);
  if (stage) query = query.eq("stage", stage);
  if (city) query = query.ilike("city", `%${city}%`);
  if (hotel === "sim") query = query.eq("hotel_experience", true);
  if (hotel === "nao") query = query.eq("hotel_experience", false);

  const { data, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const rows = (data ?? []).map((a) => {
    const j = Array.isArray(a.job) ? a.job[0] : a.job;
    return {
      ID: a.id,
      "Nome completo": a.full_name,
      "E-mail": a.email,
      "WhatsApp": a.phone_whatsapp,
      CPF: a.cpf,
      Nascimento: a.birth_date,
      Cidade: a.city,
      UF: a.state,
      Endereço: a.address ?? "",
      Vaga: j?.title ?? "Banco de talentos",
      Etapa: stageLabels[a.stage as string] ?? a.stage,
      Escolaridade: a.education ?? "",
      "Último cargo": a.last_role ?? "",
      "Área de interesse": a.interest_area ?? "",
      "Tempo de experiência": a.experience_years ?? "",
      "Disponibilidade início": a.start_availability ?? "",
      "Disponibilidade horário": a.schedule_availability ?? "",
      "Pretensão salarial": a.salary_expectation ?? "",
      "Já trabalhou em hotelaria": a.hotel_experience ? "Sim" : "Não",
      "Atendimento ao público": a.customer_service_experience ? "Sim" : "Não",
      "Recebida em": a.created_at,
    };
  });

  const csv = Papa.unparse(rows, { quotes: true });
  // BOM para Excel reconhecer UTF-8
  const body = "\uFEFF" + csv;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidaturas-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
