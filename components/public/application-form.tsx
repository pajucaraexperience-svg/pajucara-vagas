"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";
import { Stepper } from "@/components/public/stepper";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/public/field-error";
import { ResumeUpload } from "@/components/public/resume-upload";
import { DynamicQuestion, isQuestionVisible } from "@/components/public/dynamic-question";
import {
  personalSchema,
  professionalSchema,
} from "@/lib/schemas/application";
import { formatCpf, formatPhone } from "@/lib/utils/format";
import { stepperSteps, consents } from "@/lib/content/messages";
import type { Job, Question } from "@/lib/types";

const BR_STATES = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

interface Props {
  job: Job | null;
  generalQuestions: Question[];
  roleQuestions: Question[];
  isTalentPool: boolean;
  draftKey: string;
}

interface FormValues {
  // personal
  full_name: string;
  birth_date: string;
  cpf: string;
  phone_whatsapp: string;
  email: string;
  city: string;
  state: string;
  address: string;
  linkedin_url: string;
  // professional
  education: string;
  last_role: string;
  interest_area: string;
  experience_years: string;
  start_availability: string;
  schedule_availability: string;
  salary_expectation: string;
  hotel_experience: string;
  hotel_experience_detail: string;
  customer_service_experience: string;
  languages: { name: string; level: string }[];
  computer_skills: { tool: string; level: string }[];
  // dynamic answers (keyed by question id)
  answers: Record<string, unknown>;
  // resume
  resume: { url: string; name: string } | null;
  attachments: { url: string; name: string }[];
  // consents
  truthfulness_accepted: boolean;
  lgpd_accepted: boolean;
}

const STEP_KEYS = stepperSteps.map((s) => s.key);

export function ApplicationForm({
  job,
  generalQuestions,
  roleQuestions,
  isTalentPool,
  draftKey,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    mode: "onBlur",
    defaultValues: {
      full_name: "",
      birth_date: "",
      cpf: "",
      phone_whatsapp: "",
      email: "",
      city: "",
      state: "",
      address: "",
      linkedin_url: "",
      education: "",
      last_role: "",
      interest_area: "",
      experience_years: "",
      start_availability: "",
      schedule_availability: "",
      salary_expectation: "",
      hotel_experience: "",
      hotel_experience_detail: "",
      customer_service_experience: "",
      languages: [],
      computer_skills: [],
      answers: {},
      resume: null,
      attachments: [],
      truthfulness_accepted: false,
      lgpd_accepted: false,
    },
  });

  const { control, register, watch, setValue, trigger, formState, getValues, reset } =
    form;
  const values = watch();

  // ---- localStorage draft ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        reset({ ...getValues(), ...parsed });
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    const sub = watch((v) => {
      try {
        // never persist file objects beyond url
        localStorage.setItem(draftKey, JSON.stringify(v));
      } catch {
        /* ignore */
      }
    });
    return () => sub.unsubscribe();
  }, [watch, draftKey]);

  // ---- conditional question helpers ----
  const allQuestions = [...generalQuestions, ...roleQuestions];
  const labelMap = useMemo(() => {
    const m = new Map<string, string>();
    allQuestions.forEach((q) => m.set(q.label, q.id));
    return m;
  }, [allQuestions]);

  // ---- step navigation ----
  async function next() {
    let ok = true;
    if (STEP_KEYS[step] === "personal") {
      ok = await validatePersonal();
    } else if (STEP_KEYS[step] === "professional") {
      ok = await validateProfessional();
    } else if (STEP_KEYS[step] === "general") {
      ok = validateAnswers(generalQuestions);
    } else if (STEP_KEYS[step] === "specific") {
      ok = validateAnswers(roleQuestions);
    } else if (STEP_KEYS[step] === "resume") {
      if (!values.resume) {
        setSubmitError("Anexe seu currículo para continuar.");
        ok = false;
      } else {
        setSubmitError(null);
      }
    }
    if (ok) {
      setSubmitError(null);
      setStep((s) => Math.min(s + 1, stepperSteps.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
    setSubmitError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function validatePersonal() {
    const fields: (keyof FormValues)[] = [
      "full_name","birth_date","cpf","phone_whatsapp","email","city","state",
    ];
    const v = await trigger(fields as never[]);
    if (!v) return false;
    const parsed = personalSchema.safeParse({
      full_name: values.full_name,
      birth_date: values.birth_date,
      cpf: values.cpf,
      phone_whatsapp: values.phone_whatsapp,
      email: values.email,
      city: values.city,
      state: values.state,
      address: values.address,
      linkedin_url: values.linkedin_url,
    });
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      Object.entries(issues).forEach(([k, msgs]) => {
        if (msgs && msgs[0]) form.setError(k as keyof FormValues, { message: msgs[0] });
      });
      return false;
    }
    return true;
  }

  async function validateProfessional() {
    const parsed = professionalSchema.safeParse({
      education: values.education,
      last_role: values.last_role,
      interest_area: values.interest_area,
      experience_years: values.experience_years,
      start_availability: values.start_availability,
      schedule_availability: values.schedule_availability,
      salary_expectation: values.salary_expectation,
      hotel_experience: values.hotel_experience,
      hotel_experience_detail: values.hotel_experience_detail,
      customer_service_experience: values.customer_service_experience,
      languages: values.languages,
      computer_skills: values.computer_skills,
    });
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      Object.entries(issues).forEach(([k, msgs]) => {
        if (msgs && msgs[0]) form.setError(k as keyof FormValues, { message: msgs[0] });
      });
      return false;
    }
    return true;
  }

  function validateAnswers(qs: Question[]) {
    let ok = true;
    qs.forEach((q) => {
      if (!q.required) return;
      if (!isQuestionVisible(q, values.answers, labelMap)) return;
      const v = values.answers[q.id];
      const empty =
        v === undefined ||
        v === "" ||
        v === null ||
        (Array.isArray(v) && v.length === 0);
      if (empty) {
        ok = false;
        form.setError(`answers.${q.id}` as never, { message: "Resposta obrigatória" });
      }
    });
    if (!ok) {
      setSubmitError("Responda todas as perguntas obrigatórias.");
    }
    return ok;
  }

  // ---- submit ----
  async function handleSubmit() {
    setSubmitError(null);
    if (!values.truthfulness_accepted || !values.lgpd_accepted) {
      setSubmitError("É preciso aceitar as duas declarações para enviar.");
      return;
    }

    const payload = {
      job_id: job?.id ?? null,
      is_talent_pool: isTalentPool,
      personal: {
        full_name: values.full_name,
        birth_date: values.birth_date,
        cpf: values.cpf,
        phone_whatsapp: values.phone_whatsapp,
        email: values.email,
        city: values.city,
        state: values.state,
        address: values.address || null,
        linkedin_url: values.linkedin_url || null,
      },
      professional: {
        education: values.education,
        last_role: values.last_role || null,
        interest_area: values.interest_area || null,
        experience_years: values.experience_years,
        start_availability: values.start_availability,
        schedule_availability: values.schedule_availability,
        salary_expectation: values.salary_expectation || null,
        hotel_experience: values.hotel_experience === "sim",
        hotel_experience_detail: values.hotel_experience_detail || null,
        customer_service_experience: values.customer_service_experience === "sim",
        languages: values.languages,
        computer_skills: values.computer_skills,
      },
      resume_url: values.resume?.url ?? "",
      resume_name: values.resume?.name ?? "",
      attachments: values.attachments,
      consents: {
        truthfulness_accepted: values.truthfulness_accepted,
        lgpd_accepted: values.lgpd_accepted,
      },
      answers: Object.entries(values.answers).map(([qid, v]) => {
        const q = allQuestions.find((x) => x.id === qid);
        return {
          question_id: qid,
          question_label: q?.label ?? "",
          question_scope: q?.scope ?? "general",
          value: v,
        };
      }),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/candidaturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "Falha ao enviar candidatura");
      }
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      router.push("/candidatura-enviada");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao enviar";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const visibleGeneral = generalQuestions.filter((q) =>
    isQuestionVisible(q, values.answers, labelMap),
  );
  const visibleRole = roleQuestions.filter((q) =>
    isQuestionVisible(q, values.answers, labelMap),
  );

  return (
    <div>
      <Stepper current={step} />

      <div className="container-narrow py-8">
        <Card>
          <CardHeader>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Etapa {step + 1} de {stepperSteps.length}
            </p>
            <CardTitle className="font-display">
              {stepperSteps[step].title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {stepperSteps[step].description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* STEP 0 — confirmação da vaga */}
            {step === 0 && (
              <div>
                {isTalentPool ? (
                  <div className="rounded-md border bg-secondary/40 p-4">
                    <p className="font-display text-lg font-semibold">
                      Banco de talentos
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Você está se cadastrando para que o RH considere seu perfil em
                      futuras vagas. Não é necessário escolher um cargo agora.
                    </p>
                  </div>
                ) : job ? (
                  <div className="rounded-md border bg-secondary/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Você está se candidatando para
                    </p>
                    <p className="font-display mt-1 text-xl font-semibold">
                      {job.title}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {job.sector && <li>{job.sector}</li>}
                      {job.location && <li>· {job.location}</li>}
                      {job.schedule && <li>· {job.schedule}</li>}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}

            {/* STEP 1 — pessoais */}
            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome completo *" col={2}>
                  <Input {...register("full_name", { required: true })} />
                  <FieldError message={formState.errors.full_name?.message} />
                </Field>
                <Field label="Data de nascimento *">
                  <Input type="date" {...register("birth_date")} />
                  <FieldError message={formState.errors.birth_date?.message} />
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
                  <FieldError message={formState.errors.cpf?.message} />
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
                  <FieldError message={formState.errors.phone_whatsapp?.message} />
                </Field>
                <Field label="E-mail *">
                  <Input type="email" {...register("email")} />
                  <FieldError message={formState.errors.email?.message} />
                </Field>
                <Field label="Cidade *">
                  <Input {...register("city")} />
                  <FieldError message={formState.errors.city?.message} />
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
                  <FieldError message={formState.errors.state?.message} />
                </Field>
                <Field label="Endereço ou bairro" col={2}>
                  <Input {...register("address")} />
                </Field>
                <Field label="LinkedIn ou portfólio (opcional)" col={2}>
                  <Input {...register("linkedin_url")} placeholder="https://..." />
                  <FieldError message={formState.errors.linkedin_url?.message} />
                </Field>
              </div>
            )}

            {/* STEP 2 — profissionais */}
            {step === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Escolaridade *" col={2}>
                  <Controller
                    control={control}
                    name="education"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Ensino fundamental incompleto",
                            "Ensino fundamental completo",
                            "Ensino médio incompleto",
                            "Ensino médio completo",
                            "Técnico",
                            "Superior cursando",
                            "Superior completo",
                            "Pós-graduação",
                          ].map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={formState.errors.education?.message} />
                </Field>

                <Field label="Último cargo">
                  <Input {...register("last_role")} />
                </Field>
                <Field label="Área de interesse">
                  <Input {...register("interest_area")} />
                </Field>

                <Field label="Tempo de experiência *">
                  <Controller
                    control={control}
                    name="experience_years"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Sem experiência",
                            "Menos de 1 ano",
                            "1 a 3 anos",
                            "3 a 5 anos",
                            "Mais de 5 anos",
                          ].map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={formState.errors.experience_years?.message} />
                </Field>

                <Field label="Disponibilidade para início *">
                  <Controller
                    control={control}
                    name="start_availability"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Imediata",
                            "Em até 7 dias",
                            "Em até 15 dias",
                            "Em até 30 dias",
                            "A combinar",
                          ].map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={formState.errors.start_availability?.message} />
                </Field>

                <Field label="Disponibilidade de horário *" col={2}>
                  <Controller
                    control={control}
                    name="schedule_availability"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "Manhã",
                            "Tarde",
                            "Noite",
                            "Madrugada",
                            "Comercial (seg-sex)",
                            "Escala 12x36",
                            "Escala 6x1",
                            "Qualquer turno",
                          ].map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={formState.errors.schedule_availability?.message} />
                </Field>

                <Field label="Pretensão salarial (opcional)" col={2}>
                  <Input {...register("salary_expectation")} placeholder="R$" />
                </Field>

                <Field label="Já trabalhou em hotelaria? *" col={2}>
                  <Controller
                    control={control}
                    name="hotel_experience"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-2"
                      >
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm">
                          <RadioGroupItem value="sim" /> Sim
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm">
                          <RadioGroupItem value="nao" /> Não
                        </label>
                      </RadioGroup>
                    )}
                  />
                  <FieldError message={formState.errors.hotel_experience?.message} />
                </Field>

                {values.hotel_experience === "sim" && (
                  <Field label="Conte rapidamente: em qual hotel e por quanto tempo?" col={2}>
                    <Textarea rows={3} {...register("hotel_experience_detail")} />
                  </Field>
                )}

                <Field label="Tem experiência com atendimento ao público? *" col={2}>
                  <Controller
                    control={control}
                    name="customer_service_experience"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-2"
                      >
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm">
                          <RadioGroupItem value="sim" /> Sim
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 rounded-md border bg-white p-3 text-sm">
                          <RadioGroupItem value="nao" /> Não
                        </label>
                      </RadioGroup>
                    )}
                  />
                  <FieldError message={formState.errors.customer_service_experience?.message} />
                </Field>

                <Field label="Idiomas (opcional)" col={2}>
                  <RepeaterLanguages
                    value={values.languages}
                    onChange={(v) => setValue("languages", v)}
                  />
                </Field>

                <Field label="Conhecimentos em informática (opcional)" col={2}>
                  <RepeaterSkills
                    value={values.computer_skills}
                    onChange={(v) => setValue("computer_skills", v)}
                  />
                </Field>
              </div>
            )}

            {/* STEP 3 — perguntas gerais */}
            {step === 3 && (
              <div className="space-y-6">
                {visibleGeneral.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma pergunta geral configurada.
                  </p>
                )}
                {visibleGeneral.map((q) => (
                  <DynamicQuestion
                    key={q.id}
                    question={q}
                    value={values.answers[q.id]}
                    onChange={(v) =>
                      setValue("answers", { ...values.answers, [q.id]: v }, { shouldDirty: true })
                    }
                    error={
                      (formState.errors.answers as Record<string, { message?: string }> | undefined)?.[q.id]?.message
                    }
                  />
                ))}
              </div>
            )}

            {/* STEP 4 — perguntas específicas */}
            {step === 4 && (
              <div className="space-y-6">
                {visibleRole.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma pergunta específica para esta vaga.
                  </p>
                )}
                {visibleRole.map((q) => (
                  <DynamicQuestion
                    key={q.id}
                    question={q}
                    value={values.answers[q.id]}
                    onChange={(v) =>
                      setValue("answers", { ...values.answers, [q.id]: v }, { shouldDirty: true })
                    }
                    error={
                      (formState.errors.answers as Record<string, { message?: string }> | undefined)?.[q.id]?.message
                    }
                  />
                ))}
              </div>
            )}

            {/* STEP 5 — currículo */}
            {step === 5 && (
              <div className="space-y-6">
                <ResumeUpload
                  label="Currículo"
                  required
                  value={values.resume}
                  onChange={(v) => setValue("resume", v)}
                />
                <ResumeUpload
                  label="Anexos complementares (carta, certificados)"
                  multiple
                  multiValue={values.attachments}
                  onChange={() => {}}
                  onMultiChange={(v) => setValue("attachments", v)}
                />
              </div>
            )}

            {/* STEP 6 — revisão */}
            {step === 6 && (
              <div className="space-y-5">
                <ReviewBlock title="Vaga">
                  <p>{isTalentPool ? "Banco de talentos" : job?.title ?? "—"}</p>
                </ReviewBlock>

                <ReviewBlock title="Dados pessoais">
                  <p>{values.full_name}</p>
                  <p className="text-muted-foreground">
                    {values.email} · {values.phone_whatsapp}
                  </p>
                  <p className="text-muted-foreground">
                    {values.city}/{values.state}
                  </p>
                </ReviewBlock>

                <ReviewBlock title="Currículo">
                  <p>{values.resume?.name ?? "—"}</p>
                  {values.attachments.length > 0 && (
                    <p className="text-muted-foreground">
                      + {values.attachments.length} anexo(s)
                    </p>
                  )}
                </ReviewBlock>

                <div className="space-y-3 rounded-md border bg-secondary/30 p-4">
                  <label className="flex items-start gap-3 text-sm">
                    <Controller
                      control={control}
                      name="truthfulness_accepted"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(c) => field.onChange(c === true)}
                        />
                      )}
                    />
                    <span>{consents.truthfulness}</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <Controller
                      control={control}
                      name="lgpd_accepted"
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(c) => field.onChange(c === true)}
                        />
                      )}
                    />
                    <span>{consents.lgpd}</span>
                  </label>
                </div>
              </div>
            )}

            {submitError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={prev}
                disabled={step === 0 || submitting}
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>

              {step < stepperSteps.length - 1 ? (
                <Button type="button" onClick={next}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Enviar candidatura
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  col,
}: {
  label: string;
  children: React.ReactNode;
  col?: 1 | 2;
}) {
  return (
    <div className={col === 2 ? "md:col-span-2" : ""}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

function RepeaterLanguages({
  value,
  onChange,
}: {
  value: { name: string; level: string }[];
  onChange: (v: { name: string; level: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr,1fr,auto] gap-2">
          <Input
            placeholder="Idioma (ex.: inglês)"
            value={row.name}
            onChange={(e) =>
              onChange(value.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))
            }
          />
          <Select
            value={row.level}
            onValueChange={(v) =>
              onChange(value.map((r, idx) => (idx === i ? { ...r, level: v } : r)))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              {["Básico", "Intermediário", "Avançado", "Fluente"].map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        onClick={() => onChange([...value, { name: "", level: "" }])}
      >
        + Adicionar idioma
      </Button>
    </div>
  );
}

function RepeaterSkills({
  value,
  onChange,
}: {
  value: { tool: string; level: string }[];
  onChange: (v: { tool: string; level: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr,1fr,auto] gap-2">
          <Input
            placeholder="Ferramenta (ex.: Excel)"
            value={row.tool}
            onChange={(e) =>
              onChange(value.map((r, idx) => (idx === i ? { ...r, tool: e.target.value } : r)))
            }
          />
          <Select
            value={row.level}
            onValueChange={(v) =>
              onChange(value.map((r, idx) => (idx === i ? { ...r, level: v } : r)))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              {["Básico", "Intermediário", "Avançado"].map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        onClick={() => onChange([...value, { tool: "", level: "" }])}
      >
        + Adicionar conhecimento
      </Button>
    </div>
  );
}
