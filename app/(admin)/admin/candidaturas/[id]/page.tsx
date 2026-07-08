import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StageControl } from "@/components/admin/stage-control";
import { NoteForm } from "@/components/admin/note-form";
import { ResumeLink } from "@/components/admin/resume-link";
import { createClient } from "@/lib/supabase/server";
import { stageColors, stageLabels } from "@/lib/content/messages";
import { formatDate, formatDateTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ficha do candidato" };

export default async function FichaCandidato({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: app }, { data: answers }, { data: notes }] = await Promise.all([
    supabase
      .from("applications")
      .select("*, job:jobs(title, slug), course:courses(title, slug)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("application_answers")
      .select("*")
      .eq("application_id", id)
      .order("question_scope")
      .order("created_at"),
    supabase
      .from("application_notes")
      .select("id, body, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!app) notFound();
  const job = Array.isArray(app.job) ? app.job[0] : app.job;
  const course = Array.isArray(app.course) ? app.course[0] : app.course;
  const origin = job?.title
    ? job.title
    : course?.title
    ? `Curso: ${course.title}`
    : "Banco de talentos";
  const general = (answers ?? []).filter((a) => a.question_scope === "general");
  const role = (answers ?? []).filter((a) => a.question_scope === "role");

  return (
    <div className="container-page py-8">
      <Link
        href="/admin/candidaturas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Todas as candidaturas
      </Link>

      <header className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {app.full_name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {origin} · recebida em {formatDateTime(app.created_at as string)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={stageColors[app.stage as string]}>
            {stageLabels[app.stage as string]}
          </Badge>
          <StageControl applicationId={app.id as string} current={app.stage as string} />
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Dados pessoais</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <Item label="E-mail" value={app.email as string} />
              <Item label="WhatsApp" value={app.phone_whatsapp as string} />
              <Item label="CPF" value={app.cpf as string} />
              <Item
                label="Nascimento"
                value={app.birth_date ? formatDate(app.birth_date as string) : "—"}
              />
              <Item label="Cidade" value={`${app.city}/${app.state}`} />
              <Item label="Endereço" value={(app.address as string) ?? "—"} />
              <Item
                label="LinkedIn"
                value={
                  app.linkedin_url ? (
                    <a className="text-primary hover:underline" href={app.linkedin_url as string} target="_blank">
                      Abrir
                    </a>
                  ) : "—"
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Dados profissionais</CardTitle></CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <Item label="Escolaridade" value={(app.education as string) ?? "—"} />
              <Item label="Último cargo" value={(app.last_role as string) ?? "—"} />
              <Item label="Área de interesse" value={(app.interest_area as string) ?? "—"} />
              <Item label="Tempo de experiência" value={(app.experience_years as string) ?? "—"} />
              <Item label="Disponibilidade início" value={(app.start_availability as string) ?? "—"} />
              <Item label="Disponibilidade horário" value={(app.schedule_availability as string) ?? "—"} />
              <Item label="Pretensão salarial" value={(app.salary_expectation as string) ?? "—"} />
              <Item
                label="Experiência em hotelaria"
                value={app.hotel_experience ? "Sim" : "Não"}
              />
              {app.hotel_experience_detail && (
                <Item
                  col={2}
                  label="Detalhes da experiência em hotelaria"
                  value={app.hotel_experience_detail as string}
                />
              )}
              <Item
                label="Atendimento ao público"
                value={app.customer_service_experience ? "Sim" : "Não"}
              />
              <Item
                col={2}
                label="Idiomas"
                value={
                  Array.isArray(app.languages) && app.languages.length > 0
                    ? (app.languages as { name: string; level: string }[])
                        .map((l) => `${l.name} (${l.level})`)
                        .join(", ")
                    : "—"
                }
              />
              <Item
                col={2}
                label="Informática"
                value={
                  Array.isArray(app.computer_skills) && app.computer_skills.length > 0
                    ? (app.computer_skills as { tool: string; level: string }[])
                        .map((l) => `${l.tool} (${l.level})`)
                        .join(", ")
                    : "—"
                }
              />
            </CardContent>
          </Card>

          {general.length > 0 && (
            <AnswersCard title="Perguntas gerais" rows={general} />
          )}
          {role.length > 0 && (
            <AnswersCard title="Perguntas específicas" rows={role} />
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Currículo</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {app.resume_url ? (
                <ResumeLink applicationId={app.id as string} />
              ) : (
                <p className="text-sm text-muted-foreground">Sem currículo anexado.</p>
              )}
              {Array.isArray(app.attachments) && app.attachments.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Anexos complementares
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {(app.attachments as { name: string; url: string }[]).map((f, i) => (
                      <li key={i} className="text-muted-foreground">{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Observações internas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <NoteForm applicationId={app.id as string} />
              <ul className="space-y-3">
                {(notes ?? []).map((n) => (
                  <li key={n.id} className="rounded-md border bg-secondary/30 p-3 text-sm">
                    <p className="whitespace-pre-wrap">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(n.created_at as string)}
                    </p>
                  </li>
                ))}
                {(notes ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma observação ainda.
                  </p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Aceites</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>Veracidade: {app.truthfulness_accepted ? "Sim" : "Não"}</p>
              <p>LGPD: {app.lgpd_accepted ? "Sim" : "Não"}</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Item({
  label,
  value,
  col,
}: {
  label: string;
  value: React.ReactNode;
  col?: 1 | 2;
}) {
  return (
    <div className={col === 2 ? "sm:col-span-2" : ""}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5">{value}</p>
    </div>
  );
}

function AnswersCard({
  title,
  rows,
}: {
  title: string;
  rows: { question_label: string; value: unknown }[];
}) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm">
        {rows.map((r, i) => (
          <div key={i}>
            <p className="font-medium">{r.question_label}</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
              {Array.isArray(r.value)
                ? r.value.join(", ")
                : typeof r.value === "string"
                ? r.value
                : JSON.stringify(r.value)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
