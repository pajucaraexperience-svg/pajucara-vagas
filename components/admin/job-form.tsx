"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Job, JobStatus, Role } from "@/lib/types";

interface Props {
  roles: Role[];
  initial?: Partial<Job> & { id?: string };
}

export function JobForm({ roles, initial }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    role_id: initial?.role_id ?? "",
    sector: initial?.sector ?? "",
    location: initial?.location ?? "",
    schedule: initial?.schedule ?? "",
    summary: initial?.summary ?? "",
    activities: initial?.activities ?? [],
    requirements: initial?.requirements ?? [],
    desirables: initial?.desirables ?? [],
    benefits: initial?.benefits ?? [],
    status: (initial?.status ?? "draft") as JobStatus,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setError(null);
    if (!form.title.trim()) return setError("Informe o título");
    if (!form.role_id) return setError("Selecione o cargo");
    const slug =
      form.slug.trim() ||
      form.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    start(async () => {
      const res = await fetch(
        initial?.id ? `/api/admin/jobs/${initial.id}` : "/api/admin/jobs",
        {
          method: initial?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug }),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.message ?? "Falha ao salvar");
        return;
      }
      router.push("/admin/vagas");
      router.refresh();
    });
  }

  async function destroy() {
    if (!initial?.id) return;
    if (!confirm("Excluir esta vaga? Esta ação não pode ser desfeita.")) return;
    start(async () => {
      const res = await fetch(`/api/admin/jobs/${initial.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/vagas");
        router.refresh();
      } else {
        setError("Não foi possível excluir.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações principais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <Input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="gerado automaticamente"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v as JobStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="paused">Pausada</SelectItem>
                <SelectItem value="closed">Encerrada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cargo</Label>
            <Select value={form.role_id} onValueChange={(v) => set("role_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {roles
                  .filter((r) => !r.is_talent_pool)
                  .map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">
              As perguntas específicas do cargo serão usadas no formulário.
            </p>
          </div>
          <div>
            <Label>Setor</Label>
            <Input value={form.sector} onChange={(e) => set("sector", e.target.value)} />
          </div>
          <div>
            <Label>Local</Label>
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div>
            <Label>Jornada / Escala</Label>
            <Input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Resumo da função</Label>
            <Textarea
              rows={3}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <ListEditor
        title="Principais atividades"
        value={form.activities}
        onChange={(v) => set("activities", v)}
      />
      <ListEditor
        title="Requisitos obrigatórios"
        value={form.requirements}
        onChange={(v) => set("requirements", v)}
      />
      <ListEditor
        title="Diferenciais desejáveis"
        value={form.desirables}
        onChange={(v) => set("desirables", v)}
      />
      <ListEditor
        title="Benefícios"
        value={form.benefits}
        onChange={(v) => set("benefits", v)}
      />

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        {initial?.id ? (
          <Button variant="outline" type="button" onClick={destroy} disabled={pending}>
            <Trash2 className="h-4 w-4" /> Excluir vaga
          </Button>
        ) : (
          <span />
        )}
        <Button onClick={save} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
        </Button>
      </div>
    </div>
  );
}

function ListEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {value.map((row, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={row}
              onChange={(e) =>
                onChange(value.map((r, idx) => (idx === i ? e.target.value : r)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...value, ""])}
        >
          + Adicionar item
        </Button>
      </CardContent>
    </Card>
  );
}
