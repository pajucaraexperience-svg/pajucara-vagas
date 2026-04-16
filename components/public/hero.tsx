import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hero } from "@/lib/content/institutional";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-hero opacity-[0.07]"
      />
      <div className="container-page relative py-20 sm:py-28">
        <Image
          src="/logo.png"
          alt="Pajuçara Experience"
          width={220}
          height={106}
          className="mb-6 h-16 w-auto sm:h-20"
          priority
        />
        <span className="inline-flex items-center rounded-full bg-teal/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-teal-dark">
          {hero.eyebrow}
        </span>
        <h1 className="mt-5 font-display text-5xl font-light leading-[1.05] text-teal-dark sm:text-display-lg">
          {hero.title}
        </h1>
        <div className="mt-4 h-px w-24 bg-gradient-signature" />
        <p className="prose-hotel mt-6 max-w-2xl text-lg">{hero.subtitle}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
