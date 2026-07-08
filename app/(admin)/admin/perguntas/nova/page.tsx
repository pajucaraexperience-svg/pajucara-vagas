import { QuestionForm } from "@/components/admin/question-form";
import { createClient } from "@/lib/supabase/server";
import type { QuestionScope, Role } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova pergunta" };

export default async function NovaPergunta({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; role?: string }>;
}) {
  const { scope, role } = await searchParams;
  const supabase = await createClient();
  const { data: roles } = await supabase.from("roles").select("*").order("name");

  const initial =
    scope === "role" && role
      ? { scope: "role" as QuestionScope, role_id: role }
      : scope === "general"
      ? { scope: "general" as QuestionScope }
      : undefined;

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Nova pergunta</h1>
      <div className="mt-6">
        <QuestionForm roles={(roles ?? []) as Role[]} initial={initial} />
      </div>
    </div>
  );
}
