// ─────────────────────────────────────────────────────────────
// DRUM Career Conversation — Taxonomy
// Source of truth for all types in the new architecture.
// DO NOT add profiles, archetypes, or hybrid categories here.
// ─────────────────────────────────────────────────────────────

// ── Phases ──────────────────────────────────────────────────
// 4 valid phases. Autoria and Reposicionamento removed —
// their signals are absorbed by Direção and Exploração.
// Inferred AFTER the conversation — never detected live.

export const PHASES = [
  "Exploração",
  "Direção",
  "Consolidação",
  "Legado",
] as const;

export type Phase = (typeof PHASES)[number];

// ── Pathways ─────────────────────────────────────────────────
// The ONLY valid career pathways. Source: Tipos de Carreira - Drum.pdf
// No other category exists. No hybrids. No fallback types.

export const PATHWAYS = [
  "Empreendedor",
  "Executivo",
  "Profissional liberal",
  "Consultor",
  "Acadêmico",
  "Creator / Autor",
  "Sucessor",
] as const;

export type Pathway = (typeof PATHWAYS)[number];

// ── Clarity labels ───────────────────────────────────────────
// Derived from total_points_0_to_2 (2 criteria, each 0 or 1):
// 0 → Incerta | 1 → Em formação | 2 → Clara

export const CLARITY_LABELS = [
  "Incerta",
  "Em formação",
  "Clara",
] as const;

export type ClarityLabel = (typeof CLARITY_LABELS)[number];

export function clarityLabelFromPoints(points: number): ClarityLabel {
  if (points <= 0) return "Incerta";
  if (points === 1) return "Em formação";
  return "Clara";
}

export function clarityScoreFromPoints(points: number): 1 | 2 | 3 {
  if (points <= 0) return 1;
  if (points === 1) return 2;
  return 3;
}

// ── Tensions ─────────────────────────────────────────────────
// Temporary movement frictions — NOT identities or archetypes.

export const TENSIONS = [
  "Excesso de possibilidades",
  "Dependência de validação",
  "Construção sem autoria",
  "Impostor",
  "Movimento sem direção",
  "Falta de consistência",
  "Autonomia vs lealdade familiar",
  "Comparação constante",
] as const;

export type Tension = (typeof TENSIONS)[number];

// ── Action types ─────────────────────────────────────────────

export const ACTION_TYPES = ["para_dentro", "para_fora", "prototipar"] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  para_dentro: "Para dentro",
  para_fora:   "Para fora",
  prototipar:  "Prototipar",
};

// ── Editorial content ─────────────────────────────────────────
// Fixed, curated definitions per phase and pathway.
// These appear verbatim in the result view.

export type PhaseEditorial = {
  definition: string;       // What this phase is — 2 sentences
  common_conflicts: string; // What usually gets hard here — 2 sentences
};

export const PHASE_EDITORIAL: Record<Phase, PhaseEditorial> = {
  "Exploração": {
    definition:
      "Você está no momento em que o campo ainda é aberto — muitas referências, muitas perguntas, poucos compromissos firmes. A identidade profissional está sendo testada mais do que construída.",
    common_conflicts:
      "O maior risco aqui é confundir movimento com progresso: fazer muitas coisas sem que nenhuma aprofunde. A pressão externa para 'decidir logo' costuma acelerar escolhas antes do tempo.",
  },
  "Direção": {
    definition:
      "Você já tem uma aposta — um caminho que parece mais verdadeiro do que os outros. O trabalho agora é converter essa convicção em construção real, passo a passo.",
    common_conflicts:
      "A tensão típica é entre a clareza interna e a validação externa: a direção faz sentido pra você, mas ainda é difícil explicar ou provar para os outros — ou para si mesmo.",
  },
  "Consolidação": {
    definition:
      "Você está construindo tração em uma trajetória que já tem forma — o caminho está definido e o trabalho é aprofundar, sustentar e crescer dentro dele.",
    common_conflicts:
      "O desafio aqui é manter o fio do que você quer construir quando surgem oportunidades atraentes que puxam para fora do seu eixo. Consistência exige escolher o que não fazer.",
  },
  "Legado": {
    definition:
      "Você está num momento em que a carreira passou a ter uma orientação maior — construir algo que dure, que contribua, que vá além do seu desempenho individual.",
    common_conflicts:
      "A tensão típica é entre o desejo de impacto e a impaciência com os resultados de curto prazo. Construir para durar exige uma lógica diferente de construir para crescer.",
  },
};

export type PathwayEditorial = {
  definition: string;   // What this pathway is — 2 sentences
  in_practice: string;  // What it looks like concretely — 2 sentences
};

export const PATHWAY_EDITORIAL: Record<Pathway, PathwayEditorial> = {
  "Empreendedor": {
    definition:
      "A trajetória empreendedora implica criar estruturas novas, assumir risco próprio e responder por algo que não existia antes de você construir. A lógica é de fundação — não de execução dentro do que já existe.",
    in_practice:
      "Na prática, essa trajetória exige tolerância à incerteza, capacidade de vender antes de ter produto acabado e disposição para ser responsável por tudo, inclusive pelo que dá errado.",
  },
  "Executivo": {
    definition:
      "A trajetória executiva implica liderar dentro de organizações — construir times, operar em escala e fazer sistemas complexos performarem melhor. A lógica é de responsabilidade crescente dentro de estruturas existentes.",
    in_practice:
      "Na prática, essa trajetória exige habilidade para mobilizar pessoas que não são suas, navegar política organizacional e encontrar satisfação quando o time performa — não apenas quando a ideia é sua.",
  },
  "Profissional liberal": {
    definition:
      "A trajetória do profissional liberal implica construir autoridade numa competência específica e exercê-la com autonomia — sem depender de uma organização para ter relevância ou remuneração.",
    in_practice:
      "Na prática, essa trajetória exige disciplina para construir e manter uma carteira própria, tolerância à instabilidade de renda e disposição para ser o único responsável pela qualidade do que entrega.",
  },
  "Consultor": {
    definition:
      "A trajetória do consultor implica entregar valor através do diagnóstico e da recomendação — transitar entre contextos diferentes, clientes diferentes, problemas diferentes.",
    in_practice:
      "Na prática, essa trajetória exige velocidade para entrar em contextos novos e gerar valor rápido, habilidade de comunicação com quem decide e conforto com começos e fins frequentes.",
  },
  "Acadêmico": {
    definition:
      "A trajetória acadêmica implica produzir e transmitir conhecimento — a pesquisa, o ensino e a contribuição para um campo são o eixo central. O impacto é medido em décadas, não em trimestres.",
    in_practice:
      "Na prática, essa trajetória exige tolerância com resultados lentos, capacidade de sustentar interesse profundo por um problema por anos e disposição para navegar dentro de instituições.",
  },
  "Creator / Autor": {
    definition:
      "A trajetória do creator ou autor implica construir a partir da expressão — produzir obras, conteúdos ou narrativas que refletem um ponto de vista próprio e constroem audiência ao longo do tempo.",
    in_practice:
      "Na prática, essa trajetória exige consistência de publicação mesmo sem retorno imediato, tolerância com exposição pública e capacidade de transformar perspectiva em algo que outras pessoas queiram consumir.",
  },
  "Sucessor": {
    definition:
      "A trajetória do sucessor implica dar continuidade a algo construído por outros — integrar uma herança com identidade própria e exercer liderança dentro de um contexto carregado de história.",
    in_practice:
      "Na prática, essa trajetória exige navegar a tensão entre honrar o que foi construído e fazer escolhas genuinamente suas, lidar com expectativas de múltiplas gerações e construir autoridade dentro de um contexto que já tem memória.",
  },
};

// ── Structured output types ───────────────────────────────────

export type PhaseResult = {
  name: Phase;
  short_description: string; // Narrative voice — addressed directly to the person
  confidence: number;        // 0–1
  evidence: string[];
};

export type PathwayResult = {
  name: Pathway;
  short_description: string; // Narrative voice — addressed directly to the person
  confidence: number;        // 0–1
  evidence: string[];
};

export type ClarityCriterionResult = {
  score_0_to_1: 0 | 1;
  evidence: string;
};

export type ClarityResult = {
  score_1_to_3: 1 | 2 | 3;
  label: ClarityLabel;
  total_points_0_to_2: number;
  criteria: {
    direction_naming: ClarityCriterionResult;
    own_criteria:     ClarityCriterionResult;
  };
};

export type TensionResult = {
  name: Tension;
  short_description: string; // Narrative voice — addressed directly to the person
  confidence: number;        // 0–1
  evidence: string[];
};

export type Action = {
  type: ActionType;
  title: string;
  description: string;
  why_this_action: string;
  timeframe: string;
};

export type DiagnosticoMetadata = {
  anxiety_score_1_to_5: number | null;
  conversation_duration_seconds: number | null;
  mentioned_people: string[];
  mentioned_projects: string[];
  raw_summary: string;
};

// ── Main diagnostico type ─────────────────────────────────────

export type Diagnostico = {
  phase:    PhaseResult;
  pathway:  PathwayResult;
  clarity:  ClarityResult;
  tension:  TensionResult;
  actions:  [Action, Action, Action];
  metadata: DiagnosticoMetadata;
};

// ── Fallback diagnostico ──────────────────────────────────────
// Used when the Anthropic call fails. Generic by design.

export const FALLBACK_DIAGNOSTICO: Diagnostico = {
  phase: {
    name: "Exploração",
    short_description:
      "O que aparece é um momento de campo aberto — muitas possibilidades à vista, ainda sem uma aposta clara.",
    confidence: 0.5,
    evidence: [],
  },
  pathway: {
    name: "Empreendedor",
    short_description:
      "Um caminho de construção própria parece presente, mas a conversa não gerou sinal suficiente para confirmar com precisão.",
    confidence: 0.4,
    evidence: [],
  },
  clarity: {
    score_1_to_3: 1,
    label: "Incerta",
    total_points_0_to_2: 0,
    criteria: {
      direction_naming: { score_0_to_1: 0, evidence: "Sinal insuficiente na conversa." },
      own_criteria:     { score_0_to_1: 0, evidence: "Sinal insuficiente na conversa." },
    },
  },
  tension: {
    name: "Excesso de possibilidades",
    short_description:
      "A principal fricção parece ser a quantidade de caminhos abertos — cada escolha parece exigir fechar os outros.",
    confidence: 0.4,
    evidence: [],
  },
  actions: [
    {
      type: "para_dentro",
      title: "Escreva o que você não quer",
      description:
        "Pegue 15 minutos e escreva uma lista do que você definitivamente não quer construir nos próximos 3 anos. Sem justificar — só listar.",
      why_this_action:
        "Fechar portas é mais fácil do que abrir. A lista do que não quer revela o que sobra.",
      timeframe: "7 dias",
    },
    {
      type: "para_fora",
      title: "Converse com alguém que escolheu",
      description:
        "Mande mensagem para uma pessoa que você admira e que tomou uma decisão de carreira nos últimos 5 anos. Pergunte como foi o momento de decidir.",
      why_this_action:
        "Ver como outra pessoa navegou a escolha concreta é mais útil do que continuar analisando as opções sozinho.",
      timeframe: "7 dias",
    },
    {
      type: "prototipar",
      title: "Teste uma direção por uma semana",
      description:
        "Escolha um dos caminhos que aparecem na sua cabeça. Dedique 30 minutos por dia, durante 7 dias, a algo concreto relacionado a ele — sem compromisso definitivo.",
      why_this_action:
        "Uma semana de experiência real vale mais do que semanas de análise. O objetivo não é decidir: é gerar dados.",
      timeframe: "7 dias",
    },
  ],
  metadata: {
    anxiety_score_1_to_5: null,
    conversation_duration_seconds: null,
    mentioned_people: [],
    mentioned_projects: [],
    raw_summary: "Diagnóstico gerado com fallback — conversa não pôde ser processada.",
  },
};
