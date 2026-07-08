import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionsManager } from "@/components/admin/questions-manager";
import { createClient } from "@/lib/supabase/server";
import type { Question, Role } from "@/lib/types";

export const metadata = { title: "Perguntas" };
export const dynamic = "force-dynamic";

export default async function PerguntasPage() {
  const supabase = await createClient();
  const [{ data: roles }, { data: questions }] = await Promise.all([
    supabase.from("roles").select("*").order("name"),
    supabase.from("questions").select("*").order("order_index"),
  ]);

  const all = (questions ?? []) as Question[];
  const general = all.filter((q) => q.scope === "general");

  const roleGroups = ((roles ?? []) as Role[]).map((r) => ({
    id: r.id,
    name: r.name,
    questions: all.filter((q) => q.scope === "role" && q.role_id === r.id),
  }));

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Perguntas</h1>
          <p className="text-sm text-muted-foreground">
            Biblioteca geral e perguntas específicas por cargo.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/perguntas/nova">
            <Plus className="h-4 w-4" /> Nova pergunta
          </Link>
        </Button>
      </div>

      <QuestionsManager general={general} roles={roleGroups} />
    </div>
  );
}
