import { notFound } from "next/navigation";
import { JobForm } from "@/components/admin/job-form";
import { createClient } from "@/lib/supabase/server";
import type { Job, Role } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar vaga" };

export default async function EditarVaga({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: job }, { data: roles }] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", id).maybeSingle(),
    supabase.from("roles").select("*").order("name"),
  ]);
  if (!job) notFound();

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Editar vaga
      </h1>
      <div className="mt-6">
        <JobForm roles={(roles ?? []) as Role[]} initial={job as Job} />
      </div>
    </div>
  );
}
