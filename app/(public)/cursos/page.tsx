import Link from "next/link";
import { ArrowRight, MapPin, Clock, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { coursesHighlight } from "@/lib/content/institutional";
import type { Course } from "@/lib/types";

export const revalidate = 60;
export const metadata = { title: "Cursos gratuitos" };

export default async function CursosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const courses = (data ?? []) as Course[];

  return (
    <div className="container-page py-16">
      <h1 className="font-display text-4xl font-semibold text-teal-dark sm:text-display-md">
        {coursesHighlight.title}
      </h1>
      <div className="mt-3 h-px w-16 bg-gradient-signature" />
      <p className="prose-hotel mt-4 max-w-2xl">{coursesHighlight.subtitle}</p>

      {courses.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-cream-300 bg-white p-10 text-center text-sand-dark">
          No momento não há cursos com inscrições abertas. Cadastre-se no nosso banco de talentos
          para ser avisado sobre novas oportunidades.
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card
              key={c.id}
              className="group flex h-full flex-col border-cream-300 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <CardHeader>
                <CardTitle className="font-display text-2xl font-medium text-teal-dark transition-colors group-hover:text-teal">
                  {c.title}
                </CardTitle>
                {c.summary && (
                  <CardDescription className="line-clamp-3 text-dark/65">
                    {c.summary}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto space-y-4">
                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-sand-dark">
                  {c.capacity != null && (
                    <li className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> {c.capacity} vagas
                    </li>
                  )}
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
                </ul>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href={`/cursos/${c.slug}`}>
                    Ver curso
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
