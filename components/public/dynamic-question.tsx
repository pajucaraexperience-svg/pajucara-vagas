"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/public/field-error";
import type { Question } from "@/lib/types";

interface Props {
  question: Question;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}

export function DynamicQuestion({ question, value, onChange, error }: Props) {
  const id = `q-${question.id}`;
  const labelEl = (
    <Label htmlFor={id} className="block">
      {question.label}
      {question.required && <span className="ml-1 text-destructive">*</span>}
    </Label>
  );

  return (
    <div className="space-y-2">
      {labelEl}
      {question.help_text && (
        <p className="text-xs text-muted-foreground">{question.help_text}</p>
      )}

      {question.type === "short_text" && (
        <Input
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "long_text" && (
        <Textarea
          id={id}
          rows={4}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {question.type === "single" && question.options && (
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(v)}
          id={id}
        >
          {question.options.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm hover:border-primary/40"
            >
              <RadioGroupItem value={opt} />
              <span>{opt}</span>
            </label>
          ))}
        </RadioGroup>
      )}

      {question.type === "scale" && question.options && (
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt) => {
            const selected = (value as string) === opt;
            return (
              <button
                type="button"
                key={opt}
                onClick={() => onChange(opt)}
                className={`h-10 w-10 rounded-md border text-sm transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-white hover:border-primary/40"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "multi" && question.options && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const arr = (value as string[]) ?? [];
            const checked = arr.includes(opt);
            return (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm hover:border-primary/40"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => {
                    if (c) onChange([...arr, opt]);
                    else onChange(arr.filter((v) => v !== opt));
                  }}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === "boolean" && (
        <RadioGroup
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(v)}
        >
          <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm">
            <RadioGroupItem value="sim" /> Sim
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm">
            <RadioGroupItem value="nao" /> Não
          </label>
        </RadioGroup>
      )}

      <FieldError message={error} />
    </div>
  );
}

export function isQuestionVisible(
  question: Question,
  answers: Record<string, unknown>,
  questionLabelMap: Map<string, string>,
) {
  const cond = question.conditional_on;
  if (!cond) return true;
  // questionLabelMap maps label -> question id
  const refId = questionLabelMap.get(cond.question_label);
  if (!refId) return true;
  const refValue = answers[refId];
  if (cond.equals) return refValue === cond.equals;
  if (cond.not_equals) return refValue !== cond.not_equals && refValue !== undefined && refValue !== "";
  return true;
}
