"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Question, Role, QuestionType, QuestionScope } from "@/lib/types";

interface Props {
  roles: Role[];
  initial?: Partial<Question> & { id?: string };
}

export function QuestionForm({ roles, initial }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    scope: (initial?.scope ?? "general") as QuestionScope,
    role_id: initial?.role_id ?? "",
    type: (initial?.type ?? "single") as QuestionType,
    label: initial?.label ?? "",
    help_text: initial?.help_text ?? "",
    options: (initial?.options ?? []).join("\n"),
    required: initial?.required ?? false,
    order_index: initial?.order_index ?? 100,
    conditional_label: initial?.conditional_on?.question_label ?? "",
    conditional_equals: initial?.conditional_on?.equals ?? "",
    conditional_not_equals: initial?.conditional_on?.not_equals ?? "",
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setError(null);
    if (!form.label.trim()) return setError("Informe o enunciado");
    if (form.scope === "role" && !form.role_id) return setError("Selecione o cargo");

    const optionsArr = form.options
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const conditional_on = form.conditional_label
      ? {
          question_label: form.conditional_label,
          ...(form.conditional_equals ? { equals: form.conditional_equals } : {}),
          ...(form.conditional_not_equals ? { not_equals: form.conditional_not_equals } : {}),
        }
      : null;

    const payload = {
      scope: form.scope,
      role_id: form.scope === "role" ? form.role_id : null,
      type: form.type,
      label: form.label,
      help_text: form.help_text || null,
      options: ["single", "multi", "scale"].includes(form.type) ? optionsArr : null,
      required: form.required,
      order_index: Number(form.order_index) || 100,
      conditional_on,
    };

    start(async () => {
      const res = await fetch(
        initial?.id ? `/api/admin/questions/${initial.id}` : "/api/admin/questions",
        {
          method: initial?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.message ?? "Falha ao salvar");
        return;
      }
      router.push("/admin/perguntas");
      router.refresh();
    });
  }

  async function destroy() {
    if (!initial?.id || !confirm("Excluir esta pergunta?")) return;
    start(async () => {
      const res = await fetch(`/api/admin/questions/${initial.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/perguntas");
        router.refresh();
      }
    });
  }

  const showOptions = ["single", "multi", "scale"].includes(form.type);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Pergunta</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Escopo</Label>
            <Select value={form.scope} onValueChange={(v) => set("scope", v as QuestionScope)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Geral (todas as vagas)</SelectItem>
                <SelectItem value="role">Específica do cargo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.scope === "role" && (
            <div>
              <Label>Cargo</Label>
              <Select value={form.role_id} onValueChange={(v) => set("role_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v as QuestionType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Seleção única</SelectItem>
                <SelectItem value="multi">Múltipla seleção</SelectItem>
                <SelectItem value="scale">Escala (botões)</SelectItem>
                <SelectItem value="short_text">Texto curto</SelectItem>
                <SelectItem value="long_text">Texto longo</SelectItem>
                <SelectItem value="boolean">Sim/Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ordem</Label>
            <Input
              type="number"
              value={form.order_index}
              onChange={(e) => set("order_index", Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Enunciado</Label>
            <Textarea rows={2} value={form.label} onChange={(e) => set("label", e.target.value)} />
          </div>

          <div className="md:col-span-2">
            <Label>Texto de ajuda (opcional)</Label>
            <Input value={form.help_text} onChange={(e) => set("help_text", e.target.value)} />
          </div>

          {showOptions && (
            <div className="md:col-span-2">
              <Label>Opções (uma por linha)</Label>
              <Textarea
                rows={5}
                value={form.options}
                onChange={(e) => set("options", e.target.value)}
              />
            </div>
          )}

          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.required}
              onCheckedChange={(c) => set("required", c === true)}
            />
            Obrigatória
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Condicional (opcional)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Esta pergunta só aparece quando outra tiver determinada resposta. Use o
            enunciado exato da outra pergunta como referência.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-3">
            <Label>Pergunta de referência (enunciado completo)</Label>
            <Input
              value={form.conditional_label}
              onChange={(e) => set("conditional_label", e.target.value)}
            />
          </div>
          <div>
            <Label>Mostrar quando = </Label>
            <Input
              value={form.conditional_equals}
              onChange={(e) => set("conditional_equals", e.target.value)}
            />
          </div>
          <div>
            <Label>Mostrar quando ≠</Label>
            <Input
              value={form.conditional_not_equals}
              onChange={(e) => set("conditional_not_equals", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        {initial?.id ? (
          <Button variant="outline" type="button" onClick={destroy} disabled={pending}>
            <Trash2 className="h-4 w-4" /> Excluir
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
