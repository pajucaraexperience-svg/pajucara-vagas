import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("title")
    .eq("slug", slug)
    .single();
  return { title: data?.title ?? "Vaga" };
}

export default async function JobDetail({
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
  const j = job as Job;

  return (
    <article className="container-narrow py-10">
      <Link
        href="/vagas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Todas as vagas
      </Link>

      <header className="mt-6">
        <Badge variant="secondary">{j.sector ?? "Hotelaria"}</Badge>
        <h1 className="mt-3 font-display text-4xl font-semibold text-teal-dark sm:text-display-md">
          {j.title}
        </h1>
        <div className="mt-3 h-px w-16 bg-gradient-signature" />
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-sand-dark">
          {j.location && (
            <li className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {j.location}
            </li>
          )}
          {j.schedule && (
            <li className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {j.schedule}
            </li>
          )}
          {j.sector && (
            <li className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> {j.sector}
            </li>
          )}
        </ul>
      </header>

      {j.summary && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold">Sobre a vaga</h2>
          <p className="prose-hotel mt-2">{j.summary}</p>
        </section>
      )}

      {j.activities?.length > 0 && (
        <Section title="Principais atividades" items={j.activities} />
      )}
      {j.requirements?.length > 0 && (
        <Section title="Requisitos" items={j.requirements} />
      )}
      {j.desirables?.length > 0 && (
        <Section title="Diferenciais" items={j.desirables} />
      )}
      {j.benefits?.length > 0 && (
        <Section title="Benefícios" items={j.benefits} />
      )}

      <div className="mt-12 flex flex-col gap-4 rounded-3xl border border-teal/15 bg-white p-8 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl font-medium text-teal-dark">
            Pronto para se candidatar?
          </p>
          <p className="text-sm text-sand-dark">
            O preenchimento é dividido em etapas — leva poucos minutos.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={`/vagas/${j.slug}/candidatar`}>Candidatar-se</Link>
        </Button>
      </div>
    </article>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-medium text-teal-dark">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((it) => (
          <li
            key={it}
            className="prose-hotel relative pl-5 before:absolute before:left-0 before:top-2.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-gold"
          >
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}
