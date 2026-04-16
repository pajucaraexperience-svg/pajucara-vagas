import type { Metadata } from "next";
import "./globals.css";
import { brand } from "@/lib/content/institutional";

export const metadata: Metadata = {
  title: {
    default: `${brand.product} | ${brand.name}`,
    template: `%s | ${brand.product}`,
  },
  description:
    "Trabalhe Conosco no Grupo Pajuçara. Veja as vagas abertas, candidate-se ou cadastre-se no nosso banco de talentos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
