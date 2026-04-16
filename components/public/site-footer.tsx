import { footer } from "@/lib/content/institutional";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-cream-300/60 bg-cream-200/60">
      <div className="container-page flex flex-col gap-2 py-8 text-sm text-sand-dark sm:flex-row sm:items-center sm:justify-between">
        <p>{footer.copy}</p>
        <p className="max-w-md text-xs">{footer.legal}</p>
      </div>
    </footer>
  );
}
