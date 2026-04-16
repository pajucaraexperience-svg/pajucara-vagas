import { JobForm } from "@/components/admin/job-form";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova vaga" };

export default async function NovaVaga() {
  const supabase = await createClient();
  const { data: roles } = await supabase.from("roles").select("*").order("name");
  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Nova vaga</h1>
      <p className="text-sm text-muted-foreground">Preencha as informações abaixo.</p>
      <div className="mt-6">
        <JobForm roles={(roles ?? []) as Role[]} />
      </div>
    </div>
  );
}
