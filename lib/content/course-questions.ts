import type { Question } from "@/lib/types";

// Perguntas fixas do formulário de inscrição em cursos (v1).
// Renderizadas pelo componente DynamicQuestion e gravadas em application_answers
// com question_id = null e question_scope = "general".
// Os `id` são sintéticos e estáveis (usados só como chave do formulário e no
// mecanismo de conditional_on); não referenciam a tabela `questions`.
export const courseQuestions: Question[] = [
  {
    id: "course-motivation",
    scope: "general",
    role_id: null,
    order_index: 1,
    type: "long_text",
    label: "Por que você gostaria de participar do curso?",
    help_text: null,
    options: null,
    required: true,
    conditional_on: null,
  },
  {
    id: "course-has-experience",
    scope: "general",
    role_id: null,
    order_index: 2,
    type: "boolean",
    label: "Você tem experiência na área?",
    help_text: null,
    options: null,
    required: true,
    conditional_on: null,
  },
  {
    id: "course-experience-detail",
    scope: "general",
    role_id: null,
    order_index: 3,
    type: "long_text",
    label: "Se sim, conte um pouco sobre sua experiência.",
    help_text: null,
    options: null,
    required: false,
    conditional_on: { question_label: "Você tem experiência na área?", equals: "sim" },
  },
  {
    id: "course-source",
    scope: "general",
    role_id: null,
    order_index: 4,
    type: "single",
    label: "Como você ficou sabendo do curso?",
    help_text: null,
    options: [
      "Instagram",
      "Facebook",
      "WhatsApp",
      "Indicação de amigo ou familiar",
      "Site / Trabalhe Conosco",
      "Outro",
    ],
    required: true,
    conditional_on: null,
  },
];
