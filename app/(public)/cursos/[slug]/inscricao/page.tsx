import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CourseEnrollmentForm } from "@/components/public/course-enrollment-form";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();
  return { title: data ? `Inscrição · ${data.title}` : "Inscrição" };
}

export default async function CourseEnrollmentPage({
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
    <div className="container-narrow py-10">
      <Link
        href={`/cursos/${c.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao curso
      </Link>

      <header className="mt-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Inscrição</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-teal-dark">
          {c.title}
        </h1>
        <div className="mt-3 h-px w-16 bg-gradient-signature" />
        <p className="prose-hotel mt-4">
          Preencha seus dados e responda às perguntas abaixo. Leva poucos minutos.
        </p>
      </header>

      <div className="mt-8">
        <CourseEnrollmentForm course={c} />
      </div>
    </div>
  );
}
