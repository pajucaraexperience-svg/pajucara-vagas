"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, ClipboardList, HelpCircle, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/vagas", label: "Vagas", icon: Briefcase },
  { href: "/admin/perguntas", label: "Perguntas", icon: HelpCircle },
  { href: "/admin/candidaturas", label: "Candidaturas", icon: ClipboardList },
];

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-secondary/30 lg:block">
      <div className="p-5">
        <p className="font-display text-lg font-semibold text-primary">Vagas e Talentos</p>
        <p className="text-xs text-muted-foreground">Painel administrativo</p>
      </div>
      <nav className="px-3">
        {items.map((it) => {
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-secondary",
              )}
            >
              <Icon className="h-4 w-4" /> {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-60 border-t bg-white p-4 text-xs">
        <p className="text-muted-foreground">Logado como</p>
        <p className="truncate font-medium">{email}</p>
        <button
          onClick={logout}
          className="mt-2 flex items-center gap-1 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" /> Sair
        </button>
      </div>
    </aside>
  );
}
