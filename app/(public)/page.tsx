import Link from "next/link";
import { Hero } from "@/components/public/hero";
import { JobCard } from "@/components/public/job-card";
import { CourseHighlight } from "@/components/public/course-highlight";
import { Button } from "@/components/ui/button";
import { about, jobsIntro, talentPoolBlock, values } from "@/lib/content/institutional";
import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, slug, title, sector, location, schedule, summary, status")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const jobs = (data ?? []) as Job[];

  return (
    <>
      <Hero />

      <section className="container-page py-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr,1fr] md:items-start">
          <div>
            <h2 className="font-display text-display-md font-semibold text-teal-dark">
              {about.title}
            </h2>
            <div className="mt-3 h-px w-16 bg-gradient-signature" />
            {about.paragraphs.map((p) => (
              <p key={p} className="prose-hotel mt-5 max-w-prose">
                {p}
              </p>
            ))}
          </div>
          <div className="rounded-3xl border border-cream-300 bg-white p-8 shadow-card">
            <h3 className="font-display text-2xl font-medium text-teal-dark">
              {values.title}
            </h3>
            <ul className="mt-5 space-y-4">
              {values.items.map((v) => (
                <li key={v.title} className="border-l-2 border-gold/60 pl-4">
                  <p className="text-sm font-semibold text-dark">{v.title}</p>
                  <p className="text-sm text-dark/65">{v.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page pb-4">
        <CourseHighlight />
      </section>

      <section id="vagas" className="bg-cream-200/60 py-20">
        <div className="container-page">
          <h2 className="font-display text-display-md font-semibold text-teal-dark">
            {jobsIntro.title}
          </h2>
          <div className="mt-3 h-px w-16 bg-gradient-signature" />
          <p className="prose-hotel mt-4 max-w-2xl">{jobsIntro.subtitle}</p>

          {jobs.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-cream-300 bg-white p-10 text-center text-sand-dark">
              {jobsIntro.emptyState}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-20">
        <div className="relative overflow-hidden rounded-4xl border border-teal/15 bg-white p-10 shadow-elegant sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-signature opacity-10 blur-3xl"
          />
          <h3 className="font-display text-3xl font-semibold text-teal-dark sm:text-display-sm">
            {talentPoolBlock.title}
          </h3>
          <p className="prose-hotel mt-4 max-w-2xl">{talentPoolBlock.subtitle}</p>
          <Button asChild className="mt-8" size="lg">
            <Link href={talentPoolBlock.cta.href}>{talentPoolBlock.cta.label}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
