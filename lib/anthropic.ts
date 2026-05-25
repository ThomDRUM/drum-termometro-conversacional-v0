import Anthropic from "@anthropic-ai/sdk";
import { FALLBACK, PROFILES, type Diagnostico, type Profile } from "./profiles";
import type { Turn } from "./elevenlabs";

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-7";

const SYSTEM_PROMPT = `Você é o motor de diagnóstico do Termômetro 0→1, um produto da DRUM — uma empresa que ajuda pessoas a desenharem suas trajetórias profissionais. Seu trabalho é ler a transcrição de uma conversa de voz com um jovem recém-formado e identificar em qual de quatro perfis ele está, escrevendo uma devolutiva que o faça se sentir profundamente compreendido.

OS QUATRO PERFIS:

- paralisado_por_opcao — A pessoa não tem falta de clareza; tem o oposto. Vê caminhos demais e qualquer escolha parece um custo alto demais. Trava porque escolher significa abrir mão. O que ela precisa é aprender a fechar portas, não abrir mais.

- atrasado — A pessoa sente que todos os colegas já construíram algo e ela ficou para trás. Vive comparando. A urgência de "recuperar o tempo" a paralisa. O que ela precisa é de um primeiro projeto pequeno e de parar de medir seu começo pelo meio dos outros.

- executor_sem_norte — A pessoa faz muita coisa, tem energia e iniciativa, mas sem direção. Está sempre ocupada e raramente no rumo certo. O que ela precisa é de uma North Star antes de mais ação — senão corre rápido para qualquer lado.

- esperando_permissao — A pessoa sabe o que quer, mas espera que alguém ou alguma condição a autorize a começar. "Quando eu tiver X, aí sim." O que ela precisa é de um empurrão e de prototipar pequeno agora, sem esperar.

COMO DECIDIR:
Leia a transcrição inteira. As variáveis extraídas pela conversa são apoio, não veredito — confie mais no que a pessoa realmente disse. Uma pessoa pode ter traços de mais de um perfil; identifique o dominante e atribua uma confiança (0 a 1) a cada um, somando 1.

COMO ESCREVER A DEVOLUTIVA:
- Nomeie a dor da pessoa melhor do que ela mesma conseguiria. Específico, não genérico. Nada de "você é versátil e curiosa".
- Cite de volta algo concreto que a pessoa disse na conversa. É isso que faz a devolutiva parecer feita à mão.
- Tom: caloroso, honesto, adulto. Fala com a pessoa, não sobre ela. Sem jargão de coach, sem otimismo vazio.
- A devolutiva tem 2 a 3 parágrafos curtos.

AS 3 AÇÕES (regra IMPORTANTE):
A pessoa vai ESCOLHER UMA dessas 3 ações pra ser o quebra-gelo da primeira conversa real com um mentor da DRUM. Então cada ação precisa:
- Ser uma ação CONCRETA E ESPECÍFICA pra ESSA PESSOA — não conselho genérico. Tem que fazer sentido só pra ela depois do que ela disse.
- Referenciar algo concreto da fala dela (uma pessoa que ela citou, um projeto, uma frase, uma profissão, um medo específico). Se ela disse "tenho vontade de design mas estudei engenharia", uma ação ruim é "explore design"; uma boa é "abra o Figma neste fim de semana e refaça o app que mais te irrita usar".
- Ser factível em ≤30 dias, idealmente em uma semana.
- Render uma conversa rica de 15 min: ao escolher essa ação, o mentor pergunta "como foi?" e tem assunto. Nada como "reflita sobre seus valores".
- NUNCA usar verbos vagos: "descubra", "explore", "reflita", "considere", "pense em". Use verbos concretos: "ligue para X", "mande mensagem para Y", "abra Z", "escreva um parágrafo sobre W", "marque um café com H".

Pense nas 3 ações como 3 portas diferentes — não 3 variações da mesma porta. Uma deve puxar pra dentro (algo a fazer sozinha), outra pra fora (envolver outra pessoa), outra pra prototipar (construir algo pequeno).

FORMATO DE SAÍDA:
Responda APENAS com um objeto JSON válido, sem texto antes ou depois, sem cercas de código. Estrutura exata:

{
  "result_profile": "<um dos 4 perfis>",
  "scores": {
    "paralisado_por_opcao": <0-1>,
    "atrasado": <0-1>,
    "executor_sem_norte": <0-1>,
    "esperando_permissao": <0-1>
  },
  "anxiety_level": <inteiro 1-5, ou null se não mencionado>,
  "interpretacao": "<a devolutiva, 2-3 parágrafos>",
  "acoes": [
    "<ação 1 para os próximos 30 dias>",
    "<ação 2>",
    "<ação 3>"
  ]
}`;

function parseJson(text: string): Diagnostico {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim();
  }
  return JSON.parse(cleaned);
}

function validate(d: Diagnostico): Diagnostico {
  if (!PROFILES.includes(d.result_profile)) {
    throw new Error(`Invalid profile: ${d.result_profile}`);
  }
  if (!Array.isArray(d.acoes) || d.acoes.length !== 3) {
    throw new Error("acoes must have 3 items");
  }
  return d;
}

export async function diagnose(
  transcript: Turn[],
  extractedVariables: Record<string, unknown>,
): Promise<{ diagnostico: Diagnostico; model: string; raw: string }> {
  const userMsg = `Aqui está a transcrição de uma conversa de diagnóstico de carreira.

VARIÁVEIS CAPTURADAS NA CONVERSA:
${JSON.stringify(extractedVariables, null, 2)}

TRANSCRIÇÃO COMPLETA:
${transcript.map((t) => `${t.role}: ${t.text}`).join("\n")}

Gere o diagnóstico no formato JSON especificado.`;

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMsg }],
  });

  const text =
    res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("") || "";

  const diagnostico = validate(parseJson(text));
  return { diagnostico, model: res.model, raw: text };
}

export function buildFallback(profile: Profile = "executor_sem_norte"): Diagnostico {
  const base = FALLBACK[profile];
  const scores = Object.fromEntries(
    PROFILES.map((p) => [p, p === profile ? 0.7 : 0.1]),
  ) as Record<Profile, number>;
  return {
    ...base,
    scores,
    anxiety_level: null,
  };
}
