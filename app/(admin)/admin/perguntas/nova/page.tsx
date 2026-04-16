import { QuestionForm } from "@/components/admin/question-form";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova pergunta" };

export default async function NovaPergunta() {
  const supabase = await createClient();
  const { data: roles } = await supabase.from("roles").select("*").order("name");
  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Nova pergunta</h1>
      <div className="mt-6">
        <QuestionForm roles={(roles ?? []) as Role[]} />
      </div>
    </div>
  );
}
