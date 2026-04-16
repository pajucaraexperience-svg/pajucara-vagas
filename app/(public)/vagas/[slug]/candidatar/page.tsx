import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/public/application-form";
import { createClient } from "@/lib/supabase/server";
import type { Job, Question } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("title")
    .eq("slug", slug)
    .single();
  return { title: data ? `Candidatar-se · ${data.title}` : "Candidatar-se" };
}

export default async function CandidatarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!job) notFound();

  const [{ data: generalQs }, { data: roleQs }] = await Promise.all([
    supabase.from("questions").select("*").eq("scope", "general").order("order_index"),
    supabase.from("questions").select("*").eq("scope", "role").eq("role_id", (job as Job).role_id).order("order_index"),
  ]);

  return (
    <ApplicationForm
      job={job as Job}
      generalQuestions={(generalQs ?? []) as Question[]}
      roleQuestions={(roleQs ?? []) as Question[]}
      isTalentPool={false}
      draftKey={`vagas-pajucara:draft:${slug}`}
    />
  );
}
