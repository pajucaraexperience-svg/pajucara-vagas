import { ApplicationForm } from "@/components/public/application-form";
import { createClient } from "@/lib/supabase/server";
import type { Question } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Banco de talentos" };

export default async function BancoTalentosPage() {
  const supabase = await createClient();

  const { data: roleTp } = await supabase
    .from("roles")
    .select("id")
    .eq("slug", "banco-talentos")
    .single();

  const [{ data: generalQs }, { data: roleQs }] = await Promise.all([
    supabase.from("questions").select("*").eq("scope", "general").order("order_index"),
    supabase
      .from("questions")
      .select("*")
      .eq("scope", "role")
      .eq("role_id", roleTp?.id ?? "")
      .order("order_index"),
  ]);

  return (
    <ApplicationForm
      job={null}
      generalQuestions={(generalQs ?? []) as Question[]}
      roleQuestions={(roleQs ?? []) as Question[]}
      isTalentPool
      draftKey="vagas-pajucara:draft:banco-talentos"
    />
  );
}
