import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitConfirmation } from "@/lib/content/messages";

export const metadata = { title: "Candidatura enviada" };

export default function CandidaturaEnviadaPage() {
  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-teal/10 p-4">
        <CheckCircle2 className="h-12 w-12 text-teal" />
      </div>
      <h1 className="mt-5 font-display text-4xl font-semibold text-teal-dark">
        {submitConfirmation.title}
      </h1>
      <div className="mt-3 h-px w-16 bg-gradient-signature" />
      <p className="prose-hotel mt-4 max-w-prose">{submitConfirmation.body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={submitConfirmation.primaryCta.href}>
            {submitConfirmation.primaryCta.label}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={submitConfirmation.secondaryCta.href}>
            {submitConfirmation.secondaryCta.label}
          </Link>
        </Button>
      </div>
    </div>
  );
}
