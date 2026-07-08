import Link from "next/link";
import { Users, Cake, FileText, MapPin, Hotel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { stageLabels } from "@/lib/content/messages";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Análise" };
export const dynamic = "force-dynamic";

type Seg = "all" | "vagas" | "talentos" | "cursos";

const SEGMENTS: { key: Seg; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "vagas", label: "Vagas" },
  { key: "talentos", label: "Banco de talentos" },
  { key: "cursos", label: "Cursos" },
];

// Ordens canônicas (mesmas opções do formulário) — mantêm a ordem lógica no gráfico.
const EDUCATION_ORDER = [
  "Ensino fundamental incompleto",
  "Ensino fundamental completo",
  "Ensino médio incompleto",
  "Ensino médio completo",
  "Técnico",
  "Superior cursando",
  "Superior completo",
  "Pós-graduação",
];
const EXPERIENCE_ORDER = [
  "Sem experiência",
  "Menos de 1 ano",
  "1 a 3 anos",
  "3 a 5 anos",
  "Mais de 5 anos",
];
const SCHEDULE_ORDER = [
  "Manhã",
  "Tarde",
  "Noite",
  "Madrugada",
  "Comercial (seg-sex)",
  "Escala 12x36",
  "Escala 6x1",
  "Qualquer turno",
];
const AGE_ORDER = ["Até 24", "25–34", "35–44", "45–54", "55+", "Sem data"];

interface AppRow {
  id: string;
  birth_date: string | null;
  education: string | null;
  experience_years: string | null;
  schedule_availability: string | null;
  hotel_experience: boolean | null;
  customer_service_experience: boolean | null;
  city: string | null;
  state: string | null;
  stage: string;
  created_at: string;
  job_id: string | null;
  course_id: string | null;
  is_talent_pool: boolean;
  resume_url: string | null;
}

function ageOf(birth: string): number {
  const b = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
function ageBucket(birth: string | null): string {
  if (!birth) return "Sem data";
  const a = ageOf(birth);
  if (a < 25) return "Até 24";
  if (a < 35) return "25–34";
  if (a < 45) return "35–44";
  if (a < 55) return "45–54";
  return "55+";
}

// Conta valores; retorna na ordem fornecida (ou por contagem desc se order não dado).
function tally(
  rows: AppRow[],
  pick: (r: AppRow) => string | null | undefined,
  opts?: { order?: string[]; emptyLabel?: string; topN?: number },
): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = pick(r);
    const key = v == null || v === "" ? (opts?.emptyLabel ?? "Sem informação") : String(v);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (opts?.order) {
    const out = opts.order
      .map((label) => ({ label, value: counts.get(label) ?? 0 }))
      .filter((d) => d.value > 0);
    const emptyKey = opts.emptyLabel ?? "Sem informação";
    if (counts.get(emptyKey)) out.push({ label: emptyKey, value: counts.get(emptyKey) as number });
    return out;
  }
  let arr = [...counts.entries()].map(([label, value]) => ({ label, value }));
  arr.sort((a, b) => b.value - a.value);
  if (opts?.topN && arr.length > opts.topN) {
    const top = arr.slice(0, opts.topN);
    const rest = arr.slice(opts.topN).reduce((n, d) => n + d.value, 0);
    top.push({ label: "Outras", value: rest });
    return top;
  }
  return arr;
}

export default async function AnalisePage({
  searchParams,
}: {
  searchParams: Promise<{ seg?: string }>;
}) {
  const { seg: segParam } = await searchParams;
  const seg: Seg = (SEGMENTS.find((s) => s.key === segParam)?.key ?? "all") as Seg;

  const supabase = await createClient();
  const [{ data: appsData }, { data: sourceAnswers }] = await Promise.all([
    supabase
      .from("applications")
      .select(
        "id, birth_date, education, experience_years, schedule_availability, hotel_experience, customer_service_experience, city, state, stage, created_at, job_id, course_id, is_talent_pool, resume_url",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("application_answers")
      .select("application_id, value")
      .ilike("question_label", "%ficou sabendo%"),
  ]);

  const allRows = (appsData ?? []) as AppRow[];
  const rows = allRows.filter((r) => {
    if (seg === "vagas") return r.job_id != null;
    if (seg === "talentos") return r.is_talent_pool;
    if (seg === "cursos") return r.course_id != null;
    return true;
  });
  const total = rows.length;
  const rowIds = new Set(rows.map((r) => r.id));

  // KPIs
  const ages = rows.map((r) => r.birth_date).filter(Boolean).map((b) => ageOf(b as string));
  const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null;
  const withResume = rows.filter((r) => r.resume_url).length;
  const cities = new Set(rows.map((r) => (r.city ? `${r.city}/${r.state}` : null)).filter(Boolean));
  const hotelAnswered = rows.filter((r) => r.hotel_experience != null);
  const hotelYes = hotelAnswered.filter((r) => r.hotel_experience).length;
  const hotelPct = hotelAnswered.length ? Math.round((hotelYes / hotelAnswered.length) * 100) : null;

  // Distribuições
  const byAge = tally(rows, (r) => ageBucket(r.birth_date), { order: AGE_ORDER, emptyLabel: "Sem data" });
  const byEducation = tally(rows, (r) => r.education, { order: EDUCATION_ORDER });
  const byExperience = tally(rows, (r) => r.experience_years, { order: EXPERIENCE_ORDER });
  const bySchedule = tally(rows, (r) => r.schedule_availability, { order: SCHEDULE_ORDER });
  const byCity = tally(rows, (r) => (r.city ? `${r.city}/${r.state}` : null), { topN: 8 });
  const byStage = tally(rows, (r) => stageLabels[r.stage] ?? r.stage, {
    order: Object.values(stageLabels),
  });
  const boolTally = (pick: (r: AppRow) => boolean | null) => {
    const answered = rows.filter((r) => pick(r) != null);
    return [
      { label: "Sim", value: answered.filter((r) => pick(r) === true).length },
      { label: "Não", value: answered.filter((r) => pick(r) === false).length },
      { label: "Sem informação", value: rows.length - answered.length },
    ].filter((d) => d.value > 0);
  };
  const byHotel = boolTally((r) => r.hotel_experience);
  const byService = boolTally((r) => r.customer_service_experience);

  // Origem (resposta "como ficou sabendo") — só para candidaturas do segmento
  const sourceCounts = new Map<string, number>();
  for (const a of sourceAnswers ?? []) {
    if (!rowIds.has(a.application_id as string)) continue;
    const v = typeof a.value === "string" ? a.value : JSON.stringify(a.value);
    if (!v) continue;
    sourceCounts.set(v, (sourceCounts.get(v) ?? 0) + 1);
  }
  const bySource = [...sourceCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="container-page py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Análise</h1>
          <p className="text-sm text-muted-foreground">
            Perfil dos currículos recebidos, a partir dos campos padronizados.
          </p>
        </div>
        {/* Filtro de segmento */}
        <div className="flex flex-wrap gap-1 rounded-full border bg-white p-1">
          {SEGMENTS.map((s) => (
            <Link
              key={s.key}
              href={s.key === "all" ? "/admin/analise" : `/admin/analise?seg=${s.key}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                seg === s.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed bg-secondary/20 p-10 text-center text-muted-foreground">
          Nenhuma candidatura neste segmento ainda.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Candidaturas" value={String(total)} icon={<Users className="h-4 w-4" />} />
            <Stat label="Idade média" value={avgAge ? `${avgAge} anos` : "—"} icon={<Cake className="h-4 w-4" />} />
            <Stat label="Com currículo" value={`${Math.round((withResume / total) * 100)}%`} hint={`${withResume} de ${total}`} icon={<FileText className="h-4 w-4" />} />
            <Stat label="Cidades" value={String(cities.size)} icon={<MapPin className="h-4 w-4" />} />
            <Stat label="Exp. hotelaria" value={hotelPct != null ? `${hotelPct}%` : "—"} hint={hotelAnswered.length ? `de ${hotelAnswered.length} respostas` : undefined} icon={<Hotel className="h-4 w-4" />} />
          </div>

          {/* Gráficos */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <ChartCard title="Faixa etária" data={byAge} total={total} />
            <ChartCard title="Escolaridade" data={byEducation} total={total} />
            <ChartCard title="Tempo de experiência" data={byExperience} total={total} />
            <ChartCard title="Disponibilidade de horário" data={bySchedule} total={total} />
            <ChartCard title="Experiência em hotelaria" data={byHotel} total={total} />
            <ChartCard title="Experiência com atendimento" data={byService} total={total} />
            <ChartCard title="Cidades" data={byCity} total={total} />
            <ChartCard title="Etapa no funil" data={byStage} total={total} />
            {bySource.length > 0 && (
              <ChartCard
                title="Como ficaram sabendo"
                subtitle="Resposta de origem informada na candidatura"
                data={bySource}
                total={total}
              />
            )}
          </div>

          <div className="mt-6 rounded-xl border border-dashed bg-secondary/20 p-4 text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">Respostas abertas</strong> (motivação,
            trajetória profissional, pontos fortes…) não entram em gráficos por serem texto livre.
            Você pode lê-las na ficha de cada candidato ou baixar tudo pelo{" "}
            <Link href="/api/export" className="text-primary hover:underline">
              export CSV
            </Link>
            .
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <span className="text-primary/70">{icon}</span>
        </div>
        <p className="font-display mt-2 text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  subtitle,
  data,
  total,
}: {
  title: string;
  subtitle?: string;
  data: { label: string; value: number }[];
  total: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Sem dados.</p>
        ) : (
          <ul className="space-y-3">
            {data.map((d) => {
              const pct = total ? Math.round((d.value / total) * 100) : 0;
              return (
                <li key={d.label}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">{d.label}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      <span className="font-medium text-foreground">{d.value}</span> · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-teal"
                      style={{ width: `${(d.value / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
