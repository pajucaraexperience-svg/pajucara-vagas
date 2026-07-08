import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { coursesHighlight } from "@/lib/content/institutional";
import type { Course } from "@/lib/types";

// Banner de divulgação de cursos gratuitos. Server component: busca cursos ativos
// e não renderiza nada se não houver nenhum. Usado na home e na listagem de vagas.
export async function CourseHighlight() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("id, slug, title, summary, highlights, capacity, status")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const courses = (data ?? []) as Course[];
  if (courses.length === 0) return null;

  const featured = courses[0];
  const href = courses.length === 1 ? `/cursos/${featured.slug}` : "/cursos";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-gradient-to-br from-teal/5 via-white to-gold/5 p-8 shadow-card sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-signature opacity-10 blur-3xl"
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gold-dark">
            <GraduationCap className="h-3.5 w-3.5" /> {coursesHighlight.eyebrow}
          </span>
          <h3 className="mt-3 font-display text-2xl font-semibold text-teal-dark sm:text-3xl">
            {courses.length === 1 ? featured.title : coursesHighlight.title}
          </h3>
          <p className="prose-hotel mt-2">
            {courses.length === 1
              ? featured.summary ?? coursesHighlight.subtitle
              : coursesHighlight.subtitle}
          </p>
          {courses.length === 1 && featured.highlights?.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {featured.highlights.map((h) => (
                <li
                  key={h}
                  className="rounded-full border border-teal/20 bg-white px-3 py-1 text-sm text-teal-dark"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href={href}>
            {courses.length === 1 ? "Inscreva-se" : coursesHighlight.cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
