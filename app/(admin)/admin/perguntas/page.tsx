import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { Question, Role } from "@/lib/types";

export const metadata = { title: "Perguntas" };
export const dynamic = "force-dynamic";

export default async function PerguntasPage() {
  const supabase = await createClient();
  const [{ data: roles }, { data: questions }] = await Promise.all([
    supabase.from("roles").select("*").order("name"),
    supabase.from("questions").select("*").order("scope").order("order_index"),
  ]);

  const general = (questions ?? []).filter((q) => q.scope === "general") as Question[];
  const byRole = new Map<string, Question[]>();
  (questions ?? [])
    .filter((q) => q.scope === "role")
    .forEach((q) => {
      const arr = byRole.get(q.role_id as string) ?? [];
      arr.push(q as Question);
      byRole.set(q.role_id as string, arr);
    });

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Perguntas</h1>
          <p className="text-sm text-muted-foreground">
            Biblioteca geral e perguntas específicas por cargo.
          </p>
        </div>
        <Link
          href="/admin/perguntas/nova"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          + Nova pergunta
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Gerais</h2>
        <p className="text-sm text-muted-foreground">
          Aplicadas a todas as candidaturas.
        </p>
        <QuestionList list={general} />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Por cargo</h2>
        <div className="mt-3 space-y-6">
          {(roles ?? []).map((r) => {
            const list = byRole.get((r as Role).id) ?? [];
            return (
              <div key={(r as Role).id} className="rounded-xl border bg-white">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div>
                    <p className="font-medium">{(r as Role).name}</p>
                    <p className="text-xs text-muted-foreground">{list.length} pergunta(s)</p>
                  </div>
                </div>
                <QuestionList list={list} compact />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function QuestionList({
  list,
  compact,
}: {
  list: Question[];
  compact?: boolean;
}) {
  if (list.length === 0)
    return (
      <p className={compact ? "px-4 py-4 text-sm text-muted-foreground" : "mt-3 text-sm text-muted-foreground"}>
        Nenhuma pergunta cadastrada.
      </p>
    );
  return (
    <ul className={compact ? "divide-y" : "mt-3 divide-y rounded-xl border bg-white"}>
      {list.map((q) => (
        <li key={q.id} className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm">
              {q.label}
              {q.required && <span className="ml-1 text-destructive">*</span>}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Badge variant="outline">{q.type}</Badge>
              {q.conditional_on && <Badge variant="secondary">condicional</Badge>}
            </div>
          </div>
          <Link
            href={`/admin/perguntas/${q.id}`}
            className="text-xs text-primary hover:underline"
          >
            Editar
          </Link>
        </li>
      ))}
    </ul>
  );
}
