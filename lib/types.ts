export type JobStatus = "draft" | "active" | "paused" | "closed";

export type ApplicationStage =
  | "received"
  | "screening"
  | "preselected"
  | "interview_scheduled"
  | "interviewed"
  | "approved"
  | "rejected"
  | "talent_pool";

export type QuestionScope = "general" | "role";
export type QuestionType =
  | "single"
  | "multi"
  | "scale"
  | "short_text"
  | "long_text"
  | "boolean";

export type AdminRole = "admin" | "hr" | "manager";

export interface Role {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_talent_pool: boolean;
}

export interface Job {
  id: string;
  slug: string;
  role_id: string | null;
  title: string;
  sector: string | null;
  location: string | null;
  schedule: string | null;
  summary: string | null;
  activities: string[];
  requirements: string[];
  desirables: string[];
  benefits: string[];
  status: JobStatus;
  created_at: string;
  updated_at: string;
  role?: Role;
}

export interface Question {
  id: string;
  scope: QuestionScope;
  role_id: string | null;
  order_index: number;
  type: QuestionType;
  label: string;
  help_text: string | null;
  options: string[] | null;
  required: boolean;
  conditional_on: { question_label: string; equals?: string; not_equals?: string } | null;
}

export interface ApplicationAnswer {
  id: string;
  application_id: string;
  question_id: string | null;
  question_label: string;
  question_scope: QuestionScope;
  value: unknown;
}

export interface Application {
  id: string;
  job_id: string | null;
  is_talent_pool: boolean;
  full_name: string;
  birth_date: string | null;
  cpf: string;
  phone_whatsapp: string;
  email: string;
  city: string;
  state: string;
  address: string | null;
  linkedin_url: string | null;
  education: string | null;
  last_role: string | null;
  interest_area: string | null;
  experience_years: string | null;
  start_availability: string | null;
  schedule_availability: string | null;
  salary_expectation: string | null;
  hotel_experience: boolean | null;
  hotel_experience_detail: string | null;
  customer_service_experience: boolean | null;
  languages: { name: string; level: string }[] | null;
  computer_skills: { tool: string; level: string }[] | null;
  resume_url: string | null;
  attachments: { name: string; url: string }[] | null;
  truthfulness_accepted: boolean;
  lgpd_accepted: boolean;
  stage: ApplicationStage;
  created_at: string;
  updated_at: string;
  job?: Job;
  answers?: ApplicationAnswer[];
}
