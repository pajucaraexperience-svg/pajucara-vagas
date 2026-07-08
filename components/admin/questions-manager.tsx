"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Layers,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { Question, QuestionType } from "@/lib/types";

const typeLabels: Record<QuestionType, string> = {
  single: "Seleção única",
  multi: "Múltipla seleção",
  scale: "Escala",
  short_text: "Texto curto",
  long_text: "Texto longo",
  boolean: "Sim/Não",
};

interface RoleGroup {
  id: string;
  name: string;
  questions: Question[];
}

interface Props {
  general: Question[];
  roles: RoleGroup[];
}

// "general" ou o id do cargo
type Selection = string;

export function QuestionsManager({ general, roles }: Props) {
  const [selection, setSelection] = useState<Selection>("general");
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  const totalRoleQuestions = roles.reduce((n, r) => n + r.questions.length, 0);

  const filteredRoles = useMemo(() => {
    const term = roleFilter.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(term));
  }, [roles, roleFilter]);

  // Busca global: quando há texto, ignora a seleção e varre tudo.
  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return null;
    const out: { question: Question; groupLabel: string }[] = [];
    for (const q of general) {
      if (q.label.toLowerCase().includes(term))
        out.push({ question: q, groupLabel: "Geral" });
    }
    for (const r of roles) {
      for (const q of r.questions) {
        if (q.label.toLowerCase().includes(term))
          out.push({ question: q, groupLabel: r.name });
      }
    }
    return out;
  }, [search, general, roles]);

  const activeGroup = useMemo(() => {
    if (selection === "general")
      return { name: "Perguntas gerais", questions: general, roleId: null as string | null };
    const r = roles.find((x) => x.id === selection);
    return { name: r?.name ?? "", questions: r?.questions ?? [], roleId: r?.id ?? null };
  }, [selection, general, roles]);

  const newHref =
    activeGroup.roleId
      ? `/admin/perguntas/nova?scope=role&role=${activeGroup.roleId}`
      : `/admin/perguntas/nova?scope=general`;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[280px,1fr]">
      {/* ============ SIDEBAR ============ */}
      {/* Mobile: seletor nativo */}
      <div className="lg:hidden">
        <label className="text-xs text-muted-foreground">Grupo</label>
        <select
          value={selection}
          onChange={(e) => setSelection(e.target.value)}
          className="mt-1 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
        >
          <option value="general">Perguntas gerais ({general.length})</option>
          <optgroup label="Por cargo">
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.questions.length})
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Desktop: navegação vertical */}
      <aside className="hidden lg:block">
        <div className="lg:sticky lg:top-6 space-y-4">
          <button
            type="button"
            onClick={() => setSelection("general")}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
              selection === "general"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-white hover:border-primary/40",
            )}
          >
            <span className="flex items-center gap-2 font-medium">
              <Layers className="h-4 w-4" /> Perguntas gerais
            </span>
            <CountPill active={selection === "general"} n={general.length} />
          </button>

          <div>
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Por cargo
              </p>
              <span className="text-xs text-muted-foreground">{totalRoleQuestions}</span>
            </div>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                placeholder="Filtrar cargos"
                className="h-9 pl-8 text-sm"
              />
            </div>
            <div className="mt-2 max-h-[60vh] space-y-1 overflow-auto pr-1">
              {filteredRoles.map((r) => {
                const active = selection === r.id;
                const empty = r.questions.length === 0;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelection(r.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary",
                      !active && empty && "text-muted-foreground",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{r.name}</span>
                    </span>
                    <CountPill active={active} n={r.questions.length} muted={empty} />
                  </button>
                );
              })}
              {filteredRoles.length === 0 && (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Nenhum cargo encontrado.
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ============ PAINEL DE PERGUNTAS ============ */}
      <div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar em todas as perguntas..."
            className="h-11 pl-9"
          />
        </div>

        {searchResults ? (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              {searchResults.length} resultado(s) para “{search.trim()}”.
            </p>
            <div className="mt-3 space-y-2">
              {searchResults.map(({ question, groupLabel }) => (
                <QuestionRow key={question.id} q={question} groupLabel={groupLabel} />
              ))}
              {searchResults.length === 0 && (
                <EmptyBox>Nenhuma pergunta corresponde à busca.</EmptyBox>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">{activeGroup.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {activeGroup.roleId
                    ? `${activeGroup.questions.length} pergunta(s) específica(s) deste cargo.`
                    : "Aplicadas a todas as candidaturas."}
                </p>
              </div>
              <Button asChild size="sm">
                <Link href={newHref}>
                  <Plus className="h-4 w-4" /> Nova pergunta
                </Link>
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {activeGroup.questions.map((q) => (
                <QuestionRow key={q.id} q={q} />
              ))}
              {activeGroup.questions.length === 0 && (
                <EmptyBox>
                  {activeGroup.roleId
                    ? "Este cargo ainda não tem perguntas específicas."
                    : "Nenhuma pergunta geral cadastrada."}{" "}
                  <Link href={newHref} className="text-primary hover:underline">
                    Adicionar a primeira
                  </Link>
                  .
                </EmptyBox>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CountPill({ n, active, muted }: { n: number; active?: boolean; muted?: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-white/20 text-primary-foreground"
          : muted
          ? "bg-secondary text-muted-foreground"
          : "bg-secondary text-foreground/70",
      )}
    >
      {n}
    </span>
  );
}

function QuestionRow({ q, groupLabel }: { q: Question; groupLabel?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-white px-4 py-3 transition-colors hover:border-primary/30">
      <div className="min-w-0">
        <p className="text-sm font-medium">
          {q.label}
          {q.required && <span className="ml-1 text-destructive">*</span>}
        </p>
        {q.help_text && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{q.help_text}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-xs font-normal">
            {typeLabels[q.type]}
          </Badge>
          {q.required && (
            <Badge className="bg-amber-100 text-amber-800 text-xs font-normal">
              Obrigatória
            </Badge>
          )}
          {q.conditional_on && (
            <Badge variant="secondary" className="text-xs font-normal">
              Condicional
            </Badge>
          )}
          {groupLabel && (
            <span className="text-xs text-muted-foreground">· {groupLabel}</span>
          )}
        </div>
      </div>
      <Link
        href={`/admin/perguntas/${q.id}`}
        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-primary hover:bg-primary/5"
      >
        <Pencil className="h-3.5 w-3.5" /> Editar
      </Link>
    </div>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed bg-secondary/20 px-4 py-8 text-sm text-muted-foreground">
      <HelpCircle className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
