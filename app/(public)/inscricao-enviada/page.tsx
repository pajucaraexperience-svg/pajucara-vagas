import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { courseConfirmation } from "@/lib/content/messages";

export const metadata = { title: "Inscrição enviada" };

export default async function InscricaoEnviadaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const isWaitlist = status === "espera";
  const copy = isWaitlist ? courseConfirmation.espera : courseConfirmation.confirmado;

  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className={`rounded-full p-4 ${isWaitlist ? "bg-amber-100" : "bg-teal/10"}`}>
        {isWaitlist ? (
          <Clock className="h-12 w-12 text-amber-600" />
        ) : (
          <CheckCircle2 className="h-12 w-12 text-teal" />
        )}
      </div>
      <h1 className="mt-5 font-display text-4xl font-semibold text-teal-dark">
        {copy.title}
      </h1>
      <div className="mt-3 h-px w-16 bg-gradient-signature" />
      <p className="prose-hotel mt-4 max-w-prose">{copy.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={courseConfirmation.primaryCta.href}>
            {courseConfirmation.primaryCta.label}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={courseConfirmation.secondaryCta.href}>
            {courseConfirmation.secondaryCta.label}
          </Link>
        </Button>
      </div>
    </div>
  );
}
