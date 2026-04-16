import Link from "next/link";
import { ArrowRight, MapPin, Clock, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <Card className="group flex h-full flex-col border-cream-300 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="font-display text-2xl font-medium text-teal-dark transition-colors group-hover:text-teal">
          {job.title}
        </CardTitle>
        {job.summary && (
          <CardDescription className="line-clamp-2 text-dark/65">
            {job.summary}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-sand-dark">
          {job.sector && (
            <li className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> {job.sector}
            </li>
          )}
          {job.location && (
            <li className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </li>
          )}
          {job.schedule && (
            <li className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {job.schedule}
            </li>
          )}
        </ul>
        <Button asChild variant="outline" className="w-full justify-between">
          <Link href={`/vagas/${job.slug}`}>
            Ver detalhes
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
