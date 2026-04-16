import Link from "next/link";
import { Briefcase, ClipboardList, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { stageLabels, stageColors } from "@/lib/content/messages";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [
    { count: applicationsCount },
    { count: jobsActive },
    { count: talentPool },
    { data: latest },
    { data: stageRows },
  ] = await Promise.all([
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("is_talent_pool", true),
    supabase
      .from("applications")
      .select("id, full_name, email, created_at, stage, job:jobs(title)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("applications").select("stage"),
  ]);

  const stageCount = (stageRows ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.stage as string] = (acc[r.stage as string] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Visão geral do recrutamento.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Vagas ativas" value={jobsActive ?? 0} icon={<Briefcase className="h-4 w-4" />} />
        <KpiCard label="Candidaturas" value={applicationsCount ?? 0} icon={<ClipboardList className="h-4 w-4" />} />
        <KpiCard label="Banco de talentos" value={talentPool ?? 0} icon={<UserCheck className="h-4 w-4" />} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Por etapa</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {Object.keys(stageLabels).map((s) => (
                <li key={s} className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${stageColors[s]}`}>
                    {stageLabels[s]}
                  </span>
                  <span className="font-medium">{stageCount[s] ?? 0}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas candidaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {(latest ?? []).map((a) => {
                const job = Array.isArray(a.job) ? a.job[0] : a.job;
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/candidaturas/${a.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {a.full_name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {job?.title ?? "Banco de talentos"} · {formatDateTime(a.created_at as string)}
                      </p>
                    </div>
                    <Badge className={stageColors[a.stage as string]}>
                      {stageLabels[a.stage as string]}
                    </Badge>
                  </li>
                );
              })}
              {(latest ?? []).length === 0 && (
                <li className="py-6 text-center text-muted-foreground">
                  Nenhuma candidatura ainda.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-display mt-1 text-3xl font-semibold">{value}</p>
        </div>
        <div className="rounded-full bg-primary/10 p-3 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
