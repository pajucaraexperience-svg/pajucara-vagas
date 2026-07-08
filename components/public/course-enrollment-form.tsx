"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "@/components/public/field-error";
import { DynamicQuestion, isQuestionVisible } from "@/components/public/dynamic-question";
import { ResumeUpload } from "@/components/public/resume-upload";
import { personalSchema, type PersonalInput } from "@/lib/schemas/application";
import { courseQuestions } from "@/lib/content/course-questions";
import { consents } from "@/lib/content/messages";
import { formatCpf, formatPhone } from "@/lib/utils/format";
import type { Course } from "@/lib/types";

const BR_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
] as const;

interface UploadedFile {
  name: string;
  url: string;
}

export function CourseEnrollmentForm({ course }: { course: Course }) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInput>({
    resolver: zodResolver(personalSchema),
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      birth_date: "",
      cpf: "",
      phone_whatsapp: "",
      email: "",
      city: "",
      state: undefined,
      address: "",
      linkedin_url: "",
    },
  });

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [resume, setResume] = useState<UploadedFile | null>(null);
  const [lgpd, setLgpd] = useState(false);
  const [lgpdError, setLgpdError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const labelMap = useMemo(() => {
    const m = new Map<string, string>();
    courseQuestions.forEach((q) => m.set(q.label, q.id));
    return m;
  }, []);

  const visibleQuestions = courseQuestions.filter((q) =>
    isQuestionVisible(q, answers, labelMap),
  );

  function validateAnswers() {
    const errs: Record<string, string> = {};
    for (const q of visibleQuestions) {
      if (!q.required) continue;
      const v = answers[q.id];
      const empty =
        v === undefined ||
        v === null ||
        v === "" ||
        (Array.isArray(v) && v.length === 0);
      if (empty) errs[q.id] = "Este campo é obrigatório";
    }
    setAnswerErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const onValid = async (personal: PersonalInput) => {
    const answersOk = validateAnswers();
    if (!lgpd) setLgpdError("Você precisa autorizar o uso dos dados");
    else setLgpdError(null);
    if (!answersOk || !lgpd) return;

    setSubmitting(true);
    setSubmitError(null);

    const answerPayload = visibleQuestions
      .filter((q) => {
        const v = answers[q.id];
        return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
      })
      .map((q) => ({ question_label: q.label, value: answers[q.id] }));

    try {
      const res = await fetch("/api/cursos/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_slug: course.slug,
          personal: {
            full_name: personal.full_name,
            birth_date: personal.birth_date,
            cpf: personal.cpf,
            phone_whatsapp: personal.phone_whatsapp,
            email: personal.email,
            city: personal.city,
            state: personal.state,
            address: personal.address || null,
            linkedin_url: personal.linkedin_url || null,
          },
          resume: resume,
          lgpd_accepted: true,
          answers: answerPayload,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setSubmitError(j?.message ?? "Não foi possível enviar sua inscrição. Tente novamente.");
        setSubmitting(false);
        return;
      }

      const data = (await res.json()) as { id: string; waitlist: boolean };
      router.push(`/inscricao-enviada?status=${data.waitlist ? "espera" : "confirmado"}`);
    } catch {
      setSubmitError("Não foi possível enviar sua inscrição. Tente novamente.");
      setSubmitting(false);
    }
  };

  function setAnswer(id: string, v: unknown) {
    setAnswers((a) => ({ ...a, [id]: v }));
  }

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-8">
      {/* Dados pessoais */}
      <section>
        <h2 className="font-display text-xl font-semibold text-teal-dark">Seus dados</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nome completo *" col={2}>
            <Input {...register("full_name")} />
            <FieldError message={errors.full_name?.message} />
          </Field>
          <Field label="Data de nascimento *">
            <Input type="date" {...register("birth_date")} />
            <FieldError message={errors.birth_date?.message} />
          </Field>
          <Field label="CPF *">
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => field.onChange(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                />
              )}
            />
            <FieldError message={errors.cpf?.message} />
          </Field>
          <Field label="WhatsApp *">
            <Controller
              control={control}
              name="phone_whatsapp"
              render={({ field }) => (
                <Input
                  {...field}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  placeholder="(82) 99999-9999"
                />
              )}
            />
            <FieldError message={errors.phone_whatsapp?.message} />
          </Field>
          <Field label="E-mail *">
            <Input type="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </Field>
          <Field label="Cidade *">
            <Input {...register("city")} />
            <FieldError message={errors.city?.message} />
          </Field>
          <Field label="Estado *">
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {BR_STATES.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.state?.message} />
          </Field>
          <Field label="Endereço ou bairro" col={2}>
            <Input {...register("address")} />
          </Field>
          <Field label="LinkedIn ou portfólio (opcional)" col={2}>
            <Input {...register("linkedin_url")} placeholder="https://..." />
            <FieldError message={errors.linkedin_url?.message} />
          </Field>
        </div>
      </section>

      {/* Perguntas do curso */}
      <section>
        <h2 className="font-display text-xl font-semibold text-teal-dark">Sobre o curso</h2>
        <div className="mt-4 space-y-6">
          {visibleQuestions.map((q) => (
            <DynamicQuestion
              key={q.id}
              question={q}
              value={answers[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
              error={answerErrors[q.id]}
            />
          ))}
        </div>
      </section>

      {/* Currículo (opcional) */}
      <section>
        <h2 className="font-display text-xl font-semibold text-teal-dark">Currículo (opcional)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Se você já tem um currículo, anexe — ajuda a gente a te conhecer melhor. Não é obrigatório.
        </p>
        <div className="mt-4">
          <ResumeUpload
            label="Anexar currículo"
            value={resume}
            onChange={setResume}
          />
        </div>
      </section>

      {/* Consentimento */}
      <section className="space-y-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-md border bg-white p-4 text-sm">
          <Checkbox
            checked={lgpd}
            onCheckedChange={(c) => {
              setLgpd(Boolean(c));
              if (c) setLgpdError(null);
            }}
            className="mt-0.5"
          />
          <span className="text-muted-foreground">{consents.lgpd}</span>
        </label>
        <FieldError message={lgpdError ?? undefined} />
      </section>

      {submitError && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {submitError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Enviar inscrição
      </Button>
    </form>
  );
}

function Field({
  label,
  col,
  children,
}: {
  label: string;
  col?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <div className={col === 2 ? "md:col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
