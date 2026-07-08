import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data?.title ?? "Curso" };
}

export default async function CourseDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!course) notFound();
  const c = course as Course;

  return (
    <article className="container-narrow py-10">
      <Link
        href="/cursos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Todos os cursos
      </Link>

      <header className="mt-6">
        <Badge variant="secondary">Curso gratuito</Badge>
        <h1 className="mt-3 font-display text-4xl font-semibold text-teal-dark sm:text-display-md">
          {c.title}
        </h1>
        <div className="mt-3 h-px w-16 bg-gradient-signature" />
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-sand-dark">
          {c.location && (
            <li className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {c.location}
            </li>
          )}
          {c.schedule && (
            <li className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {c.schedule}
            </li>
          )}
          {c.capacity != null && (
            <li className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> {c.capacity} vagas
            </li>
          )}
        </ul>
      </header>

      {c.highlights?.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {c.highlights.map((h) => (
            <li
              key={h}
              className="rounded-full border border-teal/20 bg-teal/5 px-3 py-1 text-sm text-teal-dark"
            >
              {h}
            </li>
          ))}
        </ul>
      )}

      {c.summary && <p className="prose-hotel mt-8">{c.summary}</p>}

      {c.description && (
        <section className="mt-6">
          <p className="prose-hotel whitespace-pre-wrap">{c.description}</p>
        </section>
      )}

      <div className="mt-12 flex flex-col gap-4 rounded-3xl border border-teal/15 bg-white p-8 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl font-medium text-teal-dark">
            Garanta sua vaga
          </p>
          <p className="text-sm text-sand-dark">
            A inscrição é rápida e gratuita. Vagas limitadas.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={`/cursos/${c.slug}/inscricao`}>Inscreva-se</Link>
        </Button>
      </div>
    </article>
  );
}
