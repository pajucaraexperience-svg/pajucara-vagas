import { notFound } from "next/navigation";
import { QuestionForm } from "@/components/admin/question-form";
import { createClient } from "@/lib/supabase/server";
import type { Question, Role } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar pergunta" };

export default async function EditarPergunta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: q }, { data: roles }] = await Promise.all([
    supabase.from("questions").select("*").eq("id", id).maybeSingle(),
    supabase.from("roles").select("*").order("name"),
  ]);
  if (!q) notFound();
  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Editar pergunta</h1>
      <div className="mt-6">
        <QuestionForm roles={(roles ?? []) as Role[]} initial={q as Question} />
      </div>
    </div>
  );
}
