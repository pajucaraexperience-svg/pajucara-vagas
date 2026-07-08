import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm } from "@/components/admin/course-form";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import type { Course } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gerenciar curso" };

interface Enrollment {
  id: string;
  full_name: string;
  email: string;
  phone_whatsapp: string;
  city: string;
  state: string;
  created_at: string;
}

export default async function GerenciarCurso({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: course }, { data: enrollments }] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("applications")
      .select("id, full_name, email, phone_whatsapp, city, state, created_at")
      .eq("course_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (!course) notFound();
  const c = course as Course;
  const rows = (enrollments ?? []) as Enrollment[];
  const capacity = c.capacity ?? Infinity;

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Gerenciar curso</h1>
      <p className="text-sm text-muted-foreground">
        Edite as informações e acompanhe os inscritos.
      </p>

      <div className="mt-6">
        <CourseForm initial={c} />
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>
            Inscritos ({rows.length}
            {c.capacity != null ? ` · ${c.capacity} vagas` : ""})
          </CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href={`/api/export?course=${c.id}`}>
              <Download className="h-4 w-4" /> Exportar CSV
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Candidato</th>
                  <th className="px-4 py-3 font-medium">Cidade</th>
                  <th className="px-4 py-3 font-medium">Inscrição</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r, i) => {
                  const waitlisted = i + 1 > capacity;
                  return (
                    <tr key={r.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/candidaturas/${r.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {r.full_name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {r.email} · {r.phone_whatsapp}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {r.city}/{r.state}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {waitlisted ? (
                          <Badge className="bg-amber-100 text-amber-800">Lista de espera</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800">Confirmado</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      Nenhuma inscrição ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
