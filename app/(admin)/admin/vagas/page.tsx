import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Vagas" };
export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  closed: "bg-rose-100 text-rose-800",
};
const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativa",
  paused: "Pausada",
  closed: "Encerrada",
};

export default async function AdminVagas() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, slug, title, sector, location, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Vagas</h1>
          <p className="text-sm text-muted-foreground">Gerencie as vagas publicadas.</p>
        </div>
        <Button asChild>
          <Link href="/admin/vagas/nova">
            <Plus className="h-4 w-4" /> Nova vaga
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Setor</th>
              <th className="px-4 py-3 font-medium">Local</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Atualizada</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(jobs ?? []).map((j) => (
              <tr key={j.id}>
                <td className="px-4 py-3 font-medium">{j.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{j.sector ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{j.location ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[j.status as string]}>
                    {statusLabels[j.status as string]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDateTime(j.updated_at as string)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/vagas/${j.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {(jobs ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhuma vaga cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
