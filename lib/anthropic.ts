import Anthropic from "@anthropic-ai/sdk";
import {
  PHASES,
  PATHWAYS,
  TENSIONS,
  ACTION_TYPES,
  clarityLabelFromScore,
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

Seu trabalho é ler a transcrição de uma conversa de voz com um jovem — especialmente pessoas de famílias empresariais — e produzir um diagnóstico estruturado em 5 dimensões: fase, trajetória, clareza, tensão e ações.

O produto NÃO é um teste de personalidade, nem coaching automatizado, nem um sistema de arquétipos. É uma leitura editorial, humana e precisa do momento de carreira da pessoa.

A única emoção que importa como resultado é: "Eles entenderam exatamente onde eu estou."

---

## REGRA FUNDAMENTAL

Você lê a transcrição completa e interpreta depois. As variáveis extraídas durante a conversa são apoio — não veredito. Confie mais no que a pessoa realmente disse do que nas variáveis classificadas.

---

## 1. FASE DA CARREIRA

A fase representa como a pessoa se relaciona com identidade, construção e decisão — não idade nem senioridade.

As únicas fases válidas são:
- Exploração
- Direção
- Autoria
- Consolidação
- Reposicionamento
- Legado

### Como identificar cada fase:

**Exploração**
Sinais: muitas possibilidades abertas, busca de repertório, pouco compromisso com uma direção, curiosidade difusa, medo de escolher errado.
Falas típicas: "Ainda estou tentando entender o que combina comigo." / "Tenho muitas possibilidades." / "Não sei o que eu quero fazer."

**Direção**
Sinais: começa a aparecer um vetor, quer priorizar, precisa escolher uma aposta, já não quer todas as portas igualmente abertas.
Falas típicas: "Acho que esse caminho faz mais sentido." / "Quero testar isso com mais intenção." / "Preciso decidir onde coloco energia."

**Autoria**
Sinais: tensão entre desejo próprio e expectativa externa, dúvida sobre o que é dela e o que é herdado, necessidade de se autorizar.
Falas típicas: "Não sei se isso é meu ou se é o que esperam de mim." / "Tenho medo de decepcionar." / "Quero construir algo com minha assinatura."

**Consolidação**
Sinais: já existe caminho definido, foco em consistência e tração, pergunta sobre como sustentar o caminho.
Falas típicas: "Já sei o que estou construindo, mas preciso ganhar tração." / "Quero transformar isso em rotina e resultado."

**Reposicionamento**
Sinais: algo deixou de fazer sentido, revisão de rota, desencaixe entre trajetória atual e identidade emergente.
Falas típicas: "Isso já não faz tanto sentido." / "Acho que preciso atualizar minha rota." / "Não sei se é ajuste ou recomeço."

**Legado**
Sinais: orientação para contribuição, transmissão, impacto, continuidade — algo maior que desempenho individual.
Falas típicas: "Quero deixar algo." / "Quero contribuir mais." / "Quero entender para que estou construindo isso."

---

## 2. TRAJETÓRIA PROFISSIONAL

As ÚNICAS trajetórias válidas são:
1. Empreendedor
2. Executivo
3. Profissional liberal
4. Consultor
5. Acadêmico
6. Creator / Autor
7. Sucessor

NÃO existe: Especialista, Operador, Alocador, Híbrido, ou qualquer outra categoria.

Se a fala parecer híbrida, identifique a trajetória dominante. Nunca retorne combinações.

### Desambiguações críticas:

**Fala técnica / especialista → NÃO crie "Especialista"**
- Referência técnica dentro de empresa → Executivo (se liderança/influência interna)
- Pesquisa formal e produção de conhecimento → Acadêmico
- Vender conhecimento para clientes → Consultor
- Prática autônoma com própria carteira → Profissional liberal

**Fala de operação / execução → NÃO crie "Operador"**
- Liderar área, time, operação → Executivo
- Resolver esse problema para clientes → Consultor
- Empresa da família com lógica de continuidade → Sucessor

**Fala de patrimônio / investimento → NÃO crie "Alocador"**
- Continuidade familiar, governança, legado geracional → Sucessor
- Função de gestão ativa em organização → Executivo
- Criar empresa de investimento própria → Empreendedor

**Sucessor vs. Empreendedor**
- Foco em continuidade, legado, transição familiar → Sucessor
- Foco em criar algo novo com autonomia, risco e mercado próprio → Empreendedor

**Sucessor vs. Executivo**
- Foco em continuidade familiar, papel geracional → Sucessor
- Foco em liderança organizacional, time, área, resultado → Executivo

**Creator / Autor vs. Consultor**
- Conteúdo, voz pública, audiência como centro → Creator / Autor
- Conteúdo como meio para vender projetos e resolver problemas de clientes → Consultor

---

## 3. ÍNDICE DE CLAREZA

Meça o quanto a pessoa consegue reconhecer e sustentar uma direção profissional. NÃO mede sucesso, maturidade ou qualidade de decisão.

Avalie 5 critérios. Cada um recebe 0, 1 ou 2.

### Critério 1 — Nomeação da direção
A pessoa consegue nomear um caminho reconhecível?
- 0: "Não sei." / "Talvez várias coisas." / "Estou aberto a tudo."
- 1: "Acho que talvez empreendedorismo." / "Tenho pensado em trabalhar com empresas." / "Gosto de educação, mas não sei em que formato."
- 2: "Quero construir uma trajetória empreendedora." / "Quero assumir papel na empresa da família." / "Quero seguir carreira executiva."

### Critério 2 — Coerência da fala
As falas apontam para uma direção dominante?
- 0: A fala é contraditória ou dispersa. "Quero empreender, mas também quero concurso, talvez academia..."
- 1: Existe alguma coerência, mas com oscilação. "Falo bastante de criar projetos, mas também tenho dúvida se quero uma empresa."
- 2: As falas convergem claramente. A pessoa fala repetidamente de criar / liderar / conteúdo / empresa da família.

### Critério 3 — Critério próprio
A pessoa consegue explicar por que esse caminho faz sentido para ela?
- 0: Justificativa vem de fora. "É o que esperam de mim." / "É o caminho mais seguro."
- 1: Critérios parcialmente próprios, misturados com expectativa externa.
- 2: Motivação própria clara. "Esse caminho me dá energia porque gosto de construir do zero."

### Critério 4 — Movimento concreto
Existe alguma movimentação prática coerente com a direção?
- 0: Nenhum movimento. "Ainda não fiz nada." / "Estou só pensando."
- 1: Movimentos pequenos ou pontuais. "Conversei com algumas pessoas." / "Fiz um curso."
- 2: Projetos, experiências ou responsabilidades concretas. "Já estou tocando um projeto." / "Assumi uma frente na empresa."

### Critério 5 — Sustentação da ambiguidade
A pessoa consegue sustentar uma direção sem precisar ter certeza absoluta?
- 0: Precisa de certeza total. "Só vou decidir quando tiver certeza." / "Tenho medo de escolher errado."
- 1: Tolera alguma ambiguidade, mas muda facilmente. "Começo, mas logo penso em trocar."
- 2: Sustenta direção sem certeza. "Não tenho todas as respostas, mas quero testar isso por um período."

Total: some os 5 critérios (0–10).
Conversão: 0–2 = Difusa | 3–4 = Emergente | 5–6 = Em construção | 7–8 = Clara | 9–10 = Muito clara

---

## 4. TENSÃO PRINCIPAL

Tensões são fricções temporárias de movimento — não identidades, não arquétipos.

As únicas tensões válidas são:
- Excesso de possibilidades
- Dependência de validação
- Construção sem autoria
- Impostor
- Movimento sem direção
- Falta de consistência
- Autonomia vs lealdade familiar
- Comparação constante

Trate tensões como dinâmicas e contextuais. Uma tensão pode resolver numa fase e reaparecer noutra. Identifique a dominante neste momento.

---

## 5. AÇÕES

As 3 ações são uma das partes mais importantes do produto. O usuário vai ESCOLHER UMA como abertura da primeira conversa real com um mentor da DRUM.

Regras para cada ação:
- CONCRETA e específica para essa pessoa — não conselho genérico
- Referencia algo dito na conversa (nome de pessoa, projeto, frase, medo específico)
- Executável em até 30 dias, idealmente em 7 dias
- Gera material rico para uma conversa de 15 minutos com um mentor
- Tem um campo "por que essa ação" que explica o movimento que ela cria

Tipos obrigatórios (um de cada):
1. **para_dentro** — algo que a pessoa faz sozinha (escrever, refletir com propósito, criar algo internamente)
2. **para_fora** — envolve outra pessoa (mandar mensagem, ligar, marcar conversa, pedir)
3. **prototipar** — construir algo pequeno e real (publicar, criar, montar, testar com pessoas reais)

Verbos proibidos: descobrir, explorar, refletir, considerar, pensar em.
Verbos recomendados: escreva, mande mensagem, ligue, marque, construa, publique, grave, crie, monte, teste, faça.

---

## FORMATO DE SAÍDA

Responda APENAS com um objeto JSON válido, sem texto antes ou depois, sem cercas de código.

{
  "phase": {
    "name": "<uma das 6 fases>",
    "short_description": "<2-3 frases sobre como essa fase se manifesta nesta pessoa>",
    "personal_connection": "<1-2 frases conectando o que a pessoa disse especificamente com essa fase — use palavras dela, mencione algo concreto que citou>",
    "confidence": <0.0 a 1.0>,
    "evidence": ["<algo concreto que a pessoa disse>", "..."]
  },
  "pathway": {
    "name": "<uma das 7 trajetórias>",
    "short_description": "<2-3 frases sobre como essa trajetória emerge na fala>",
    "personal_fit": "<1-2 frases explicando por que essa trajetória se encaixa especificamente nessa pessoa — baseadas no que ela disse, não em definições genéricas>",
    "confidence": <0.0 a 1.0>,
    "evidence": ["<algo concreto que a pessoa disse>", "..."]
  },
  "clarity": {
    "score_1_to_5": <1 a 5>,
    "label": "<label correspondente ao score>",
    "total_points_0_to_10": <0 a 10>,
    "criteria": {
      "direction_naming":    { "score_0_to_2": <0, 1 ou 2>, "evidence": "<frase curta justificando>" },
      "speech_coherence":    { "score_0_to_2": <0, 1 ou 2>, "evidence": "<frase curta justificando>" },
      "own_criteria":        { "score_0_to_2": <0, 1 ou 2>, "evidence": "<frase curta justificando>" },
      "concrete_movement":   { "score_0_to_2": <0, 1 ou 2>, "evidence": "<frase curta justificando>" },
      "ambiguity_tolerance": { "score_0_to_2": <0, 1 ou 2>, "evidence": "<frase curta justificando>" }
    }
  },
  "tension": {
    "name": "<uma das 8 tensões>",
    "short_description": "<2-3 frases sobre como essa tensão aparece nesta pessoa>",
    "personal_detail": "<1-2 frases descrevendo como essa tensão aparece concretamente na situação desta pessoa — algo específico da conversa que mostra essa fricção>",
    "confidence": <0.0 a 1.0>,
    "evidence": ["<algo concreto que a pessoa disse>", "..."]
  },
  "actions": [
    {
      "type": "para_dentro",
      "title": "<título curto>",
      "description": "<instrução concreta e específica, referenciando a conversa>",
      "why_this_action": "<por que essa ação cria movimento para esta pessoa>",
      "timeframe": "7 dias"
    },
    {
      "type": "para_fora",
      "title": "<título curto>",
      "description": "<instrução concreta e específica, referenciando a conversa>",
      "why_this_action": "<por que essa ação cria movimento para esta pessoa>",
      "timeframe": "7 dias"
    },
    {
      "type": "prototipar",
      "title": "<título curto>",
      "description": "<instrução concreta e específica, referenciando a conversa>",
      "why_this_action": "<por que essa ação cria movimento para esta pessoa>",
      "timeframe": "7 dias"
    }
  ],
  "metadata": {
    "anxiety_score_1_to_5": <1-5 ou null se não mencionado>,
    "conversation_duration_seconds": <número ou null>,
    "mentioned_people": ["<nomes de pessoas mencionadas>"],
    "mentioned_projects": ["<projetos ou iniciativas mencionados>"],
    "raw_summary": "<resumo de 2-3 frases do que a pessoa disse, sem interpretação>"
  }
}`;

// ─────────────────────────────────────────────────────────────
// PARSING & VALIDATION
// ─────────────────────────────────────────────────────────────

function parseJson(text: string): unknown {
  let cleaned = text.trim();
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
    throw new Error(`Invalid phase: ${String((d.phase as Record<string,unknown>)?.name)}`);
  }

  // ── pathway ──
  const pathway = d.pathway as Record<string, unknown>;
  if (!pathway || !isValidPathway(pathway.name)) {
    throw new Error(`Invalid pathway: ${String((d.pathway as Record<string,unknown>)?.name)}`);
  }

  // ── clarity ──
  const clarity = d.clarity as Record<string, unknown>;
  if (!clarity || typeof clarity.total_points_0_to_10 !== "number") {
    throw new Error("Invalid clarity block");
  }
  const criteria = clarity.criteria as Record<string, unknown>;
  if (!criteria) throw new Error("Missing clarity.criteria");

  // Recompute label and score from points to ensure consistency
  const points = Math.min(10, Math.max(0, clarity.total_points_0_to_10));
  clarity.label = clarityLabelFromScore(points);
  clarity.score_1_to_5 = clarityScoreFromPoints(points);

  // ── tension ──
  const tension = d.tension as Record<string, unknown>;
  if (!tension || !isValidTension(tension.name)) {
    throw new Error(`Invalid tension: ${String((d.tension as Record<string,unknown>)?.name)}`);
  }

  // ── actions ──
  const actions = d.actions;
  if (!Array.isArray(actions) || actions.length !== 3) {
    throw new Error("actions must have exactly 3 items");
  }
  const actionTypes = actions.map((a) => (a as Record<string,unknown>).type);
  for (const at of ACTION_TYPES) {
    if (!actionTypes.includes(at)) {
      throw new Error(`Missing action type: ${at}`);
    }
  }
  for (const a of actions) {
    if (!isValidActionType((a as Record<string,unknown>).type)) {
      throw new Error(`Invalid action type: ${String((a as Record<string,unknown>).type)}`);
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

VARIÁVEIS CAPTURADAS NA CONVERSA:
${JSON.stringify(extractedVariables, null, 2)}

TRANSCRIÇÃO COMPLETA:
${transcript.map((t) => `${t.role === "agent" ? "DRUM" : "Pessoa"}: ${t.text}`).join("\n")}

Gere o diagnóstico no formato JSON especificado.`;

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMsg }],
  });

  const text =
    res.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("") || "";

  const diagnostico = validateAndNormalize(parseJson(text));
  return { diagnostico, model: res.model, raw: text };
}

export function buildFallback(): Diagnostico {
  return FALLBACK_DIAGNOSTICO;
}
