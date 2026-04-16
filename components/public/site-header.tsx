import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/60 bg-cream/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Pajuçara Experience"
            width={140}
            height={68}
            className="h-10 w-auto"
            priority
          />
          <span className="hidden border-l border-cream-300 pl-3 font-display text-lg font-medium text-teal-dark sm:inline">
            Vagas e Talentos
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
