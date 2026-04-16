import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">404</p>
      <h1 className="font-display text-3xl font-semibold">Página não encontrada</h1>
      <p className="prose-hotel max-w-prose">
        O conteúdo que você procura pode ter sido movido ou removido.
      </p>
      <Link href="/" className="mt-2 text-primary hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
