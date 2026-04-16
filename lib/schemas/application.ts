import { z } from "zod";
import { isValidCpf } from "@/lib/utils/format";

const BR_STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
] as const;

export const personalSchema = z.object({
  full_name: z.string().min(3, "Nome muito curto").max(150),
  birth_date: z.string().min(1, "Informe sua data de nascimento"),
  cpf: z
    .string()
    .min(1, "Informe seu CPF")
    .refine((v) => isValidCpf(v), "CPF inválido"),
  phone_whatsapp: z
    .string()
    .min(1, "Informe seu telefone")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  email: z.string().email("E-mail inválido"),
  city: z.string().min(2, "Informe sua cidade"),
  state: z.enum(BR_STATES, { errorMap: () => ({ message: "Selecione o estado" }) }),
  address: z.string().optional().or(z.literal("")),
  linkedin_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

export const professionalSchema = z.object({
  education: z.string().min(1, "Informe sua escolaridade"),
  last_role: z.string().optional().or(z.literal("")),
  interest_area: z.string().optional().or(z.literal("")),
  experience_years: z.string().min(1, "Informe seu tempo de experiência"),
  start_availability: z.string().min(1, "Informe sua disponibilidade de início"),
  schedule_availability: z.string().min(1, "Informe sua disponibilidade de horário"),
  salary_expectation: z.string().optional().or(z.literal("")),
  hotel_experience: z.enum(["sim", "nao"], { errorMap: () => ({ message: "Selecione uma opção" }) }),
  hotel_experience_detail: z.string().optional().or(z.literal("")),
  customer_service_experience: z.enum(["sim", "nao"], { errorMap: () => ({ message: "Selecione uma opção" }) }),
  languages: z
    .array(z.object({ name: z.string().min(1), level: z.string().min(1) }))
    .default([]),
  computer_skills: z
    .array(z.object({ tool: z.string().min(1), level: z.string().min(1) }))
    .default([]),
});

export const consentsSchema = z.object({
  truthfulness_accepted: z.literal(true, {
    errorMap: () => ({ message: "Você precisa declarar a veracidade das informações" }),
  }),
  lgpd_accepted: z.literal(true, {
    errorMap: () => ({ message: "Você precisa autorizar o uso dos dados" }),
  }),
});

// Respostas dinâmicas (gerais + específicas) ficam num record.
export const answersSchema = z.record(z.string(), z.unknown());

export const applicationSchema = personalSchema
  .merge(professionalSchema)
  .extend({
    job_id: z.string().uuid().nullable(),
    is_talent_pool: z.boolean(),
    resume_url: z.string().min(1, "Anexe seu currículo"),
    attachments: z
      .array(z.object({ name: z.string(), url: z.string() }))
      .default([]),
    answers: answersSchema,
  })
  .merge(consentsSchema);

export type PersonalInput = z.infer<typeof personalSchema>;
export type ProfessionalInput = z.infer<typeof professionalSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
