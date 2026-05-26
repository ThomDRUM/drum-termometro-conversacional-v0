import Anthropic from "@anthropic-ai/sdk";
import {
  PHASES,
  PATHWAYS,
  TENSIONS,
  ACTION_TYPES,
  clarityLabelFromPoints,
  clarityScoreFromPoints,
  FALLBACK_DIAGNOSTICO,
  type Diagnostico,
  type Phase,
  type Pathway,
  type Tension,
  type ActionType,
} from "./taxonomy";
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

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-5";

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é o motor de diagnóstico da DRUM Career Conversation.

Seu trabalho é ler a transcrição de uma conversa de voz e produzir um diagnóstico estruturado em 5 dimensões: fase, trajetória, clareza, tensão e ações.

O produto NÃO é um teste de personalidade. É uma leitura editorial, humana e precisa do momento de carreira da pessoa.

A única emoção que importa como resultado é: "Eles entenderam exatamente onde eu estou."

REGRA FUNDAMENTAL: leia a transcrição completa e interprete depois. As variáveis extraídas são apoio — confie no que a pessoa realmente disse.

TOM DOS CAMPOS short_description: escreva como se estivesse falando diretamente com a pessoa. Use "você". Comece com "O que aparece na sua fala é..." ou "O que chama atenção é..." ou "O que emerge é...". Seja direto e específico — evite frases genéricas que poderiam descrever qualquer pessoa.

---

## 1. FASE DA CARREIRA

As 4 fases válidas:
- Exploração
- Direção
- Consolidação
- Legado

### Como identificar:

**Exploração**
Campo aberto, muitas possibilidades, poucas apostas firmes. Também cobre quem está recalibrando depois de algo que deixou de fazer sentido.
Sinais: curiosidade difusa, medo de escolher errado, "não sei o que quero", "tenho muitas opções", "isso já não faz sentido, preciso reavaliar".

**Direção**
Tem uma aposta, está construindo convicção. Também cobre quem sente tensão entre o que quer e o que esperam dela.
Sinais: um vetor começa a aparecer, quer priorizar, "acho que esse caminho faz mais sentido", "não sei se isso é meu ou o que esperam de mim", "quero construir algo com minha assinatura".

**Consolidação**
Trajetória em movimento, foco é tração e profundidade.
Sinais: caminho definido, pergunta sobre como sustentar, "já sei o que estou construindo", "preciso ganhar tração", "quero aprofundar".

**Legado**
Orientado para contribuição e impacto duradouro na carreira — não tem a ver com idade ou família.
Sinais: "quero deixar algo", "quero construir algo que dure", "quero que isso signifique algo além de mim".

---

## 2. TRAJETÓRIA PROFISSIONAL

As 7 trajetórias válidas:
1. Empreendedor
2. Executivo
3. Profissional liberal
4. Consultor
5. Acadêmico
6. Creator / Autor
7. Sucessor

NÃO existe: Especialista, Operador, Alocador, Híbrido. Se a fala parecer híbrida, identifique a trajetória dominante.

### Desambiguações críticas:
- Fala técnica/especialista → Executivo (liderança), Acadêmico (pesquisa), Consultor (clientes), Profissional liberal (carteira própria)
- Fala de operação/execução → Executivo (liderar time/área), Consultor (resolver para clientes), Sucessor (empresa familiar)
- Fala de patrimônio/investimento → Sucessor (continuidade familiar), Executivo (gestão ativa), Empreendedor (empresa própria de investimento)
- Sucessor vs Empreendedor: continuidade/legado familiar → Sucessor; criar novo com autonomia/risco → Empreendedor
- Creator vs Consultor: audiência como centro → Creator; conteúdo como meio para vender projetos → Consultor

---

## 3. ÍNDICE DE CLAREZA DE TRAJETÓRIA

Mede o quanto a pessoa parece consciente da trajetória que está construindo. NÃO mede sucesso ou maturidade.

2 critérios. Cada um recebe 0 ou 1. Total: 0 a 2 pontos.

**Critério 1 — Nomeação da trajetória**
A pessoa consegue nomear a trajetória com palavras próprias?
- 0: "Não sei." / "Estou aberto a tudo." / Resposta completamente aberta.
- 1: A pessoa nomeia um caminho reconhecível — "quero empreender", "quero carreira executiva", "quero criar conteúdo", "quero continuar na empresa da família".

**Critério 2 — Critério próprio**
A justificativa para essa trajetória vem de dentro da pessoa?
- 0: Justificativa vem de fora — "é o que esperam de mim", "é o caminho mais seguro", "minha família acha que faz sentido".
- 1: Justificativa própria — "esse caminho me dá energia", "gosto de construir do zero", "faz sentido pra mim porque...".

Conversão: 0 pontos = Incerta · 1 ponto = Em formação · 2 pontos = Clara

---

## 4. TENSÃO PRINCIPAL

As 8 tensões válidas:
- Excesso de possibilidades
- Dependência de validação
- Construção sem autoria
- Impostor
- Movimento sem direção
- Falta de consistência
- Autonomia vs lealdade familiar
- Comparação constante

Identifique a tensão dominante neste momento. Trate como dinâmica e contextual — não como identidade.

---

## 5. AÇÕES

As 3 ações são a parte mais prática do produto. O usuário vai ESCOLHER UMA como abertura da primeira conversa com um mentor da DRUM.

Regras obrigatórias:
- CONCRETA e específica para essa pessoa — referencia algo que ela disse (nome de projeto, pessoa, decisão, frase específica)
- Executável em 7 dias
- Tem um campo "why_this_action" que explica o movimento que cria
- NÃO pode ser genérica o suficiente para servir para qualquer pessoa

Tipos obrigatórios (um de cada):
1. para_dentro — a pessoa faz sozinha (escrever, refletir com propósito específico)
2. para_fora — envolve outra pessoa (mandar mensagem, ligar, marcar conversa)
3. prototipar — construir algo pequeno e real (publicar, criar, montar, testar)

Verbos proibidos: descobrir, explorar, refletir, considerar, pensar em.
Verbos recomendados: escreva, mande mensagem, ligue, marque, construa, publique, grave, crie, monte, teste, faça.

---

## FORMATO DE SAÍDA

Responda APENAS com um objeto JSON válido. Sem texto antes ou depois. Sem cercas de código (não use \`\`\`json).

{
  "phase": {
    "name": "<uma das 4 fases>",
    "short_description": "<1-2 frases dirigidas à pessoa com 'você', começando com 'O que aparece...' ou 'O que chama atenção...' — específico para essa conversa>",
    "confidence": <0.0 a 1.0>,
    "evidence": ["<algo que a pessoa disse>", "..."]
  },
  "pathway": {
    "name": "<uma das 7 trajetórias>",
    "short_description": "<1-2 frases dirigidas à pessoa com 'você', explicando por que essa trajetória emerge nessa conversa específica>",
    "confidence": <0.0 a 1.0>,
    "evidence": ["<algo que a pessoa disse>", "..."]
  },
  "clarity": {
    "score_1_to_3": <1, 2 ou 3>,
    "label": "<Incerta, Em formação ou Clara>",
    "total_points_0_to_2": <0, 1 ou 2>,
    "criteria": {
      "direction_naming": { "score_0_to_1": <0 ou 1>, "evidence": "<frase justificando>" },
      "own_criteria":     { "score_0_to_1": <0 ou 1>, "evidence": "<frase justificando>" }
    }
  },
  "tension": {
    "name": "<uma das 8 tensões>",
    "short_description": "<1-2 frases dirigidas à pessoa com 'você', descrevendo como essa tensão aparece especificamente nessa conversa>",
    "confidence": <0.0 a 1.0>,
    "evidence": ["<algo que a pessoa disse>", "..."]
  },
  "actions": [
    {
      "type": "para_dentro",
      "title": "<título curto>",
      "description": "<instrução concreta referenciando algo específico da conversa>",
      "why_this_action": "<por que cria movimento para esta pessoa>",
      "timeframe": "7 dias"
    },
    {
      "type": "para_fora",
      "title": "<título curto>",
      "description": "<instrução concreta referenciando algo específico da conversa>",
      "why_this_action": "<por que cria movimento para esta pessoa>",
      "timeframe": "7 dias"
    },
    {
      "type": "prototipar",
      "title": "<título curto>",
      "description": "<instrução concreta referenciando algo específico da conversa>",
      "why_this_action": "<por que cria movimento para esta pessoa>",
      "timeframe": "7 dias"
    }
  ],
  "metadata": {
    "anxiety_score_1_to_5": <1-5 ou null>,
    "conversation_duration_seconds": <número ou null>,
    "mentioned_people": ["<nomes mencionados>"],
    "mentioned_projects": ["<projetos mencionados>"],
    "raw_summary": "<resumo neutro de 2-3 frases do que a pessoa disse, sem interpretação>"
  }
}`;

// ─────────────────────────────────────────────────────────────
// PARSING & VALIDATION
// ─────────────────────────────────────────────────────────────

function parseJson(text: string): unknown {
  let cleaned = text.trim();
  // Strip markdown fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  return JSON.parse(cleaned);
}

function isValidPhase(v: unknown): v is Phase {
  return PHASES.includes(v as Phase);
}

function isValidPathway(v: unknown): v is Pathway {
  return PATHWAYS.includes(v as Pathway);
}

function isValidTension(v: unknown): v is Tension {
  return TENSIONS.includes(v as Tension);
}

function isValidActionType(v: unknown): v is ActionType {
  return ACTION_TYPES.includes(v as ActionType);
}

function validateAndNormalize(raw: unknown): Diagnostico {
  if (!raw || typeof raw !== "object") throw new Error("Output is not an object");
  const d = raw as Record<string, unknown>;

  // ── phase ──
  const phase = d.phase as Record<string, unknown>;
  if (!phase || !isValidPhase(phase.name)) {
    throw new Error(`Invalid phase: "${String(phase?.name)}". Valid: ${PHASES.join(", ")}`);
  }

  // ── pathway ──
  const pathway = d.pathway as Record<string, unknown>;
  if (!pathway || !isValidPathway(pathway.name)) {
    throw new Error(`Invalid pathway: "${String(pathway?.name)}". Valid: ${PATHWAYS.join(", ")}`);
  }

  // ── clarity ──
  const clarity = d.clarity as Record<string, unknown>;
  if (!clarity || typeof clarity.total_points_0_to_2 !== "number") {
    throw new Error(`Invalid clarity block. total_points_0_to_2 must be a number, got: ${JSON.stringify(clarity)}`);
  }
  const criteria = clarity.criteria as Record<string, unknown>;
  if (!criteria) throw new Error("Missing clarity.criteria");
  if (!("direction_naming" in criteria) || !("own_criteria" in criteria)) {
    throw new Error(`Missing clarity criteria fields. Got: ${Object.keys(criteria).join(", ")}`);
  }

  // Recompute label and score from points to ensure consistency
  const points = Math.min(2, Math.max(0, Math.round(clarity.total_points_0_to_2 as number)));
  clarity.label         = clarityLabelFromPoints(points);
  clarity.score_1_to_3  = clarityScoreFromPoints(points);
  clarity.total_points_0_to_2 = points;

  // ── tension ──
  const tension = d.tension as Record<string, unknown>;
  if (!tension || !isValidTension(tension.name)) {
    throw new Error(`Invalid tension: "${String(tension?.name)}". Valid: ${TENSIONS.join(", ")}`);
  }

  // ── actions ──
  const actions = d.actions;
  if (!Array.isArray(actions) || actions.length !== 3) {
    throw new Error(`actions must have exactly 3 items, got: ${Array.isArray(actions) ? actions.length : typeof actions}`);
  }
  const actionTypes = actions.map((a) => (a as Record<string, unknown>).type);
  for (const at of ACTION_TYPES) {
    if (!actionTypes.includes(at)) {
      throw new Error(`Missing action type: "${at}". Got: ${actionTypes.join(", ")}`);
    }
  }
  for (const a of actions) {
    if (!isValidActionType((a as Record<string, unknown>).type)) {
      throw new Error(`Invalid action type: "${String((a as Record<string, unknown>).type)}"`);
    }
  }

  return d as unknown as Diagnostico;
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

export async function diagnose(
  transcript: Turn[],
  extractedVariables: Record<string, unknown>,
): Promise<{ diagnostico: Diagnostico; model: string; raw: string }> {

  const userMsg = `Aqui está a transcrição de uma conversa de diagnóstico de carreira.

VARIÁVEIS CAPTURADAS:
${JSON.stringify(extractedVariables, null, 2)}

TRANSCRIÇÃO COMPLETA:
${transcript.map((t) => `${t.role === "agent" ? "DRUM" : "Pessoa"}: ${t.text}`).join("\n")}

Gere o diagnóstico no formato JSON especificado. Responda APENAS com o JSON — sem texto antes ou depois, sem cercas de código.`;

  console.log(`[diagnose] Calling ${MODEL} with ${transcript.length} turns`);

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

  console.log(`[diagnose] Raw response (first 300 chars): ${text.slice(0, 300)}`);

  let parsed: unknown;
  try {
    parsed = parseJson(text);
  } catch (e) {
    throw new Error(`JSON parse failed: ${String(e)}\nRaw text: ${text.slice(0, 500)}`);
  }

  let diagnostico: Diagnostico;
  try {
    diagnostico = validateAndNormalize(parsed);
  } catch (e) {
    throw new Error(`Validation failed: ${String(e)}\nParsed: ${JSON.stringify(parsed).slice(0, 500)}`);
  }

  console.log(`[diagnose] Success — phase: ${diagnostico.phase.name}, pathway: ${diagnostico.pathway.name}, clarity: ${diagnostico.clarity.label}`);

  return { diagnostico, model: res.model, raw: text };
}

export function buildFallback(): Diagnostico {
  return FALLBACK_DIAGNOSTICO;
}
