import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils/format";

export const metadata = { title: "Cursos" };
export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  active: "bg-emerald-100 text-emerald-800",
  closed: "bg-rose-100 text-rose-800",
};
const statusLabels: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  closed: "Encerrado",
};

interface CourseRow {
  id: string;
  title: string;
  location: string | null;
  capacity: number | null;
  status: string;
  updated_at: string;
  enrollments: { count: number }[];
}

export default async function AdminCursos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, title, location, capacity, status, updated_at, enrollments:applications(count)")
    .order("updated_at", { ascending: false });

  const courses = (data ?? []) as CourseRow[];

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Cursos</h1>
          <p className="text-sm text-muted-foreground">
            Cursos gratuitos de qualificação e recrutamento.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cursos/nova">
            <Plus className="h-4 w-4" /> Novo curso
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Curso</th>
              <th className="px-4 py-3 font-medium">Local</th>
              <th className="px-4 py-3 font-medium">Inscritos</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Atualizado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {courses.map((c) => {
              const enrolled = c.enrollments?.[0]?.count ?? 0;
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.location ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {enrolled}
                    {c.capacity != null ? ` / ${c.capacity}` : ""}
                    {c.capacity != null && enrolled > c.capacity && (
                      <span className="ml-2 text-xs text-amber-700">
                        +{enrolled - c.capacity} em espera
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[c.status]}>
                      {statusLabels[c.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(c.updated_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/cursos/${c.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Gerenciar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {courses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum curso cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
