import { CourseForm } from "@/components/admin/course-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo curso" };

export default function NovoCurso() {
  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Novo curso</h1>
      <p className="text-sm text-muted-foreground">Preencha as informações abaixo.</p>
      <div className="mt-6">
        <CourseForm />
      </div>
    </div>
  );
}
