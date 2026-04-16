import { JobCard } from "@/components/public/job-card";
import { jobsIntro } from "@/lib/content/institutional";
import { createClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/types";

export const revalidate = 60;
export const metadata = { title: "Vagas abertas" };

export default async function VagasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jobs")
    .select("id, slug, title, sector, location, schedule, summary, status")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const jobs = (data ?? []) as Job[];

  return (
    <div className="container-page py-16">
      <h1 className="font-display text-4xl font-semibold text-teal-dark sm:text-display-md">
        {jobsIntro.title}
      </h1>
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
  );
}
