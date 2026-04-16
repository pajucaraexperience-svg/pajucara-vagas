import Link from "next/link";
import { brand } from "@/lib/content/institutional";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/60 bg-cream/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-medium text-teal-dark">
            {brand.product}
          </span>
          <span className="hidden text-xs uppercase tracking-widest text-sand-dark sm:inline">
            · {brand.name}
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-body">
          <Link
            href="/vagas"
            className="text-dark/70 transition-colors hover:text-teal"
          >
            Vagas
          </Link>
          <Link
            href="/banco-de-talentos"
            className="text-dark/70 transition-colors hover:text-teal"
          >
            Banco de talentos
          </Link>
        </nav>
      </div>
    </header>
  );
}
