import Link from "next/link";
import { Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { stageColors, stageLabels } from "@/lib/content/messages";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Candidaturas" };
export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  job?: string;
  stage?: string;
  city?: string;
  experience?: string;
  hotel?: string;
}

export default async function CandidaturasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(
      "id, full_name, email, city, state, hotel_experience, experience_years, stage, created_at, job:jobs(title, slug)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (params.q)
    query = query.or(
      `full_name.ilike.%${params.q}%,email.ilike.%${params.q}%,cpf.ilike.%${params.q}%`,
    );
  if (params.job) query = query.eq("job_id", params.job);
  if (params.stage) query = query.eq("stage", params.stage);
  if (params.city) query = query.ilike("city", `%${params.city}%`);
  if (params.experience) query = query.eq("experience_years", params.experience);
  if (params.hotel === "sim") query = query.eq("hotel_experience", true);
  if (params.hotel === "nao") query = query.eq("hotel_experience", false);

  const [{ data, count }, { data: jobs }] = await Promise.all([
    query,
    supabase
      .from("jobs")
      .select("id, title")
      .order("title"),
  ]);

  const exportQs = new URLSearchParams(params as Record<string, string>).toString();

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Candidaturas
          </h1>
          <p className="text-sm text-muted-foreground">
            {count ?? 0} {count === 1 ? "candidatura" : "candidaturas"} encontrada(s).
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/api/export?${exportQs}`}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Link>
        </Button>
      </div>

      <form
        method="get"
        className="mt-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <div className="lg:col-span-2">
          <label className="text-xs text-muted-foreground">Buscar</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Nome, e-mail ou CPF"
              className="pl-8"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Vaga</label>
          <select
            name="job"
            defaultValue={params.job ?? ""}
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="">Todas</option>
            {(jobs ?? []).map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Etapa</label>
          <select
            name="stage"
            defaultValue={params.stage ?? ""}
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="">Todas</option>
            {Object.entries(stageLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Cidade</label>
          <Input name="city" defaultValue={params.city ?? ""} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Hotelaria</label>
          <select
            name="hotel"
            defaultValue={params.hotel ?? ""}
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="">—</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-6 flex justify-end gap-2">
          <Button type="submit">Filtrar</Button>
          <Button asChild type="button" variant="outline">
            <Link href="/admin/candidaturas">Limpar</Link>
          </Button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Candidato</th>
              <th className="px-4 py-3 font-medium">Vaga</th>
              <th className="px-4 py-3 font-medium">Cidade</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Recebida</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(data ?? []).map((a) => {
              const job = Array.isArray(a.job) ? a.job[0] : a.job;
              return (
                <tr key={a.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/candidaturas/${a.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {a.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {job?.title ?? <em>Banco de talentos</em>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.city}/{a.state}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={stageColors[a.stage as string]}>
                      {stageLabels[a.stage as string]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(a.created_at as string)}
                  </td>
                </tr>
              );
            })}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhuma candidatura encontrada com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
