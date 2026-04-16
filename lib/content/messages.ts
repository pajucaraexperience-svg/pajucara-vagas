export const stepperSteps = [
  { key: "confirm", title: "Vaga", description: "Confirme a vaga escolhida" },
  { key: "personal", title: "Dados pessoais", description: "Quem é você" },
  { key: "professional", title: "Dados profissionais", description: "Sua experiência" },
  { key: "general", title: "Perguntas gerais", description: "Sobre você no trabalho" },
  { key: "specific", title: "Perguntas da vaga", description: "Específicas do cargo" },
  { key: "resume", title: "Currículo", description: "Anexos" },
  { key: "review", title: "Revisão", description: "Confirme e envie" },
] as const;

export const submitConfirmation = {
  title: "Candidatura recebida com sucesso!",
  body:
    "Obrigado por se candidatar ao Grupo Pajuçara. Recebemos suas informações e, caso seu perfil esteja alinhado à vaga, nossa equipe entrará em contato nas próximas etapas do processo seletivo.",
  primaryCta: { label: "Voltar às vagas", href: "/vagas" },
  secondaryCta: { label: "Cadastrar em outra vaga", href: "/" },
};

export const consents = {
  truthfulness:
    "Declaro que todas as informações prestadas nesta candidatura são verdadeiras e que respondo pela veracidade delas.",
  lgpd:
    "Autorizo o Grupo Pajuçara a utilizar meus dados exclusivamente para fins de recrutamento e seleção, em conformidade com a Lei Geral de Proteção de Dados (LGPD).",
};

export const validation = {
  required: "Este campo é obrigatório",
  email: "Informe um e-mail válido",
  cpf: "Informe um CPF válido (11 dígitos)",
  phone: "Informe um telefone válido com DDD",
  resumeRequired: "Anexe seu currículo para finalizar",
  resumeType: "Aceitamos apenas PDF, DOC ou DOCX",
  resumeSize: "O arquivo precisa ter até 10 MB",
};

export const stageLabels: Record<string, string> = {
  received: "Candidatura recebida",
  screening: "Em triagem",
  preselected: "Pré-selecionado",
  interview_scheduled: "Entrevista agendada",
  interviewed: "Entrevistado",
  approved: "Aprovado",
  rejected: "Não selecionado",
  talent_pool: "Banco de talentos",
};

export const stageColors: Record<string, string> = {
  received: "bg-slate-100 text-slate-700",
  screening: "bg-amber-100 text-amber-800",
  preselected: "bg-blue-100 text-blue-800",
  interview_scheduled: "bg-indigo-100 text-indigo-800",
  interviewed: "bg-violet-100 text-violet-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-rose-100 text-rose-800",
  talent_pool: "bg-sand-100 text-amber-900",
};
