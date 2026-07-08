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
import type { Course, CourseStatus } from "@/lib/types";

interface Props {
  initial?: Partial<Course> & { id?: string };
}

export function CourseForm({ initial }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    summary: initial?.summary ?? "",
    description: initial?.description ?? "",
    highlights: initial?.highlights ?? [],
    location: initial?.location ?? "",
    schedule: initial?.schedule ?? "",
    capacity: initial?.capacity != null ? String(initial.capacity) : "",
    status: (initial?.status ?? "draft") as CourseStatus,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setError(null);
    if (!form.title.trim()) return setError("Informe o título");
    const slug =
      form.slug.trim() ||
      form.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const capacity =
      form.capacity.trim() === "" ? null : Number(form.capacity);
    if (capacity != null && (!Number.isInteger(capacity) || capacity < 0)) {
      return setError("Capacidade deve ser um número inteiro positivo");
    }

    start(async () => {
      const res = await fetch(
        initial?.id ? `/api/admin/cursos/${initial.id}` : "/api/admin/cursos",
        {
          method: initial?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug, capacity }),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.message ?? "Falha ao salvar");
        return;
      }
      router.push("/admin/cursos");
      router.refresh();
    });
  }

  async function destroy() {
    if (!initial?.id) return;
    if (!confirm("Excluir este curso? Esta ação não pode ser desfeita.")) return;
    start(async () => {
      const res = await fetch(`/api/admin/cursos/${initial.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/cursos");
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
          <CardTitle>Informações do curso</CardTitle>
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
            <Select value={form.status} onValueChange={(v) => set("status", v as CourseStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativo (inscrições abertas)</SelectItem>
                <SelectItem value="closed">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Vagas (capacidade)</Label>
            <Input
              type="number"
              min={0}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="ex.: 15"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Inscrições acima da capacidade entram automaticamente na lista de espera.
            </p>
          </div>
          <div>
            <Label>Local</Label>
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Datas / horário</Label>
            <Input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Resumo (aparece nos cards e no topo da página)</Label>
            <Textarea
              rows={2}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Descrição completa</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <ListEditor
        title="Destaques (ex.: Gratuito, Certificado, carga horária)"
        value={form.highlights}
        onChange={(v) => set("highlights", v)}
      />

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        {initial?.id ? (
          <Button variant="outline" type="button" onClick={destroy} disabled={pending}>
            <Trash2 className="h-4 w-4" /> Excluir curso
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
