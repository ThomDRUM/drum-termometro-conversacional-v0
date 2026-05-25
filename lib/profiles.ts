export const PROFILES = [
  "paralisado_por_opcao",
  "atrasado",
  "executor_sem_norte",
  "esperando_permissao",
] as const;

export type Profile = (typeof PROFILES)[number];

export const PROFILE_LABELS: Record<Profile, string> = {
  paralisado_por_opcao: "Paralisado por Opção",
  atrasado: "Atrasado",
  executor_sem_norte: "Executor sem Norte",
  esperando_permissao: "Esperando Permissão",
};

export type Diagnostico = {
  result_profile: Profile;
  scores: Record<Profile, number>;
  anxiety_level: number | null;
  interpretacao: string;
  acoes: [string, string, string];
};

export const FALLBACK: Record<Profile, Omit<Diagnostico, "scores" | "anxiety_level">> = {
  paralisado_por_opcao: {
    result_profile: "paralisado_por_opcao",
    interpretacao:
      "Seu problema não é falta de clareza — é o contrário. Você enxerga caminhos demais, e cada escolha parece exigir que você abra mão dos outros. Por isso trava: decidir dói. O próximo passo não é descobrir mais opções, é aprender a fechar portas sem sentir que está perdendo algo.",
    acoes: [
      "Escolha um único caminho para explorar a fundo por 30 dias.",
      "Liste o que você NÃO vai fazer neste mês.",
      "Converse com uma pessoa que já seguiu um dos caminhos que você considera.",
    ],
  },
  atrasado: {
    result_profile: "atrasado",
    interpretacao:
      "Você sente que todo mundo já construiu algo e que você ficou para trás. Mas você está comparando o seu começo com o meio dos outros — e isso é uma medida injusta. Você não está atrasado; você está no início, e o início parece assim para todo mundo.",
    acoes: [
      "Comece um projeto pequeno que caiba num fim de semana.",
      "Pare de abrir o LinkedIn por 30 dias.",
      "Escreva três coisas que você já fez e desvaloriza.",
    ],
  },
  executor_sem_norte: {
    result_profile: "executor_sem_norte",
    interpretacao:
      "Você tem energia e iniciativa de sobra — faz coisas, começa coisas, se move. O que falta não é ação, é direção. Sem uma North Star, toda essa energia corre rápido para qualquer lado.",
    acoes: [
      "Escreva em uma frase como você quer que sua vida esteja em três anos.",
      "Antes de aceitar o próximo projeto, cheque se ele aproxima dessa frase.",
      "Escolha uma área para aprofundar em vez de espalhar.",
    ],
  },
  esperando_permissao: {
    result_profile: "esperando_permissao",
    interpretacao:
      "Você sabe o que quer — isso é mais do que muita gente tem. O que trava você é a espera: por uma condição, um aval, o momento certo. Mas o momento certo raramente chega; ele se constrói começando pequeno.",
    acoes: [
      "Defina a menor versão possível do que você quer fazer e comece esta semana.",
      "Marque uma conversa com alguém que já faz isso.",
      "Identifique de quem você está esperando permissão — e siga sem ela.",
    ],
  },
};
