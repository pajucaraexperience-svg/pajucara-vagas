import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  // verifica se está em admin_users (autoriza)
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow) {
    return (
      <div className="container-narrow py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Acesso negado</h1>
        <p className="prose-hotel mt-2">
          Sua conta ainda não foi habilitada como administradora. Solicite ao gestor
          do sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh">
      <AdminSidebar email={adminRow.email} />
      <div className="flex-1 bg-muted/40">{children}</div>
    </div>
  );
}
