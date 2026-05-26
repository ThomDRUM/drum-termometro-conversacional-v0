# Prompt da Anthropic — Motor de Diagnóstico
## DRUM Career Conversation

Este é o prompt que o sistema envia à API da Anthropic depois que a conversa de voz termina. Ele recebe a transcrição + as variáveis extraídas pela ElevenLabs e devolve o diagnóstico em JSON, pronto para gravar em `assessment_results`.

O prompt completo e oficial vive em `lib/anthropic.ts` (constante `SYSTEM_PROMPT`). Este documento é a referência de leitura humana.

---

## Arquitetura do diagnóstico

O sistema produz 5 dimensões:

1. **Fase** — como a pessoa se relaciona com identidade, construção e decisão
2. **Trajetória** — qual caminho profissional emerge com mais força
3. **Clareza** — índice 0–10 com 5 critérios avaliados por âncoras
4. **Tensão** — fricção de movimento dominante neste momento
5. **Ações** — 3 ações concretas (para_dentro / para_fora / prototipar)

---

## Fases válidas (6)

- Exploração
- Direção
- Autoria
- Consolidação
- Reposicionamento
- Legado

A fase é inferida **depois** da conversa a partir de padrões narrativos. O agente nunca sabe a fase durante a conversa.

---

## Trajetórias válidas (7)

Fonte oficial: `Tipos de Carreira - Drum.pdf`

1. Empreendedor
2. Executivo
3. Profissional liberal
4. Consultor
5. Acadêmico
6. Creator / Autor
7. Sucessor

**NÃO existem:** Especialista, Operador, Alocador, Híbrido.
Se a fala parecer híbrida, o sistema identifica a trajetória dominante.

---

## Índice de clareza

5 critérios × (0 / 1 / 2) = total 0–10

| Critério | O que mede |
|---|---|
| Nomeação da direção | A pessoa consegue nomear um caminho? |
| Coerência da fala | As falas convergem para uma direção? |
| Critério próprio | A justificativa é interna ou externa? |
| Movimento concreto | Existe ação prática coerente com a direção? |
| Sustentação da ambiguidade | Aguenta avançar sem certeza absoluta? |

Conversão: 0–2 Difusa · 3–4 Emergente · 5–6 Em construção · 7–8 Clara · 9–10 Muito clara

As âncoras completas (exemplos de falas para cada nível) estão em `CAREER_PATHWAYS_RULES.md`.

---

## Tensões válidas (8)

- Excesso de possibilidades
- Dependência de validação
- Construção sem autoria
- Impostor
- Movimento sem direção
- Falta de consistência
- Autonomia vs lealdade familiar
- Comparação constante

---

## JSON de saída

```json
{
  "phase": {
    "name": "<fase>",
    "short_description": "<2-3 frases>",
    "confidence": 0.82,
    "evidence": ["<frase da transcrição>"]
  },
  "pathway": {
    "name": "<trajetória>",
    "short_description": "<2-3 frases>",
    "confidence": 0.78,
    "evidence": ["<frase da transcrição>"]
  },
  "clarity": {
    "score_1_to_5": 3,
    "label": "Em construção",
    "total_points_0_to_10": 6,
    "criteria": {
      "direction_naming":    { "score_0_to_2": 1, "evidence": "..." },
      "speech_coherence":    { "score_0_to_2": 2, "evidence": "..." },
      "own_criteria":        { "score_0_to_2": 1, "evidence": "..." },
      "concrete_movement":   { "score_0_to_2": 1, "evidence": "..." },
      "ambiguity_tolerance": { "score_0_to_2": 1, "evidence": "..." }
    }
  },
  "tension": {
    "name": "<tensão>",
    "short_description": "<2-3 frases>",
    "confidence": 0.84,
    "evidence": ["<frase da transcrição>"]
  },
  "actions": [
    {
      "type": "para_dentro",
      "title": "<título curto>",
      "description": "<instrução concreta referenciando a conversa>",
      "why_this_action": "<por que cria movimento para esta pessoa>",
      "timeframe": "7 dias"
    },
    { "type": "para_fora", ... },
    { "type": "prototipar", ... }
  ],
  "metadata": {
    "anxiety_score_1_to_5": 4,
    "conversation_duration_seconds": 260,
    "mentioned_people": ["pai", "irmã"],
    "mentioned_projects": ["nova frente digital"],
    "raw_summary": "<resumo neutro da conversa>"
  }
}
```

---

## Notas de implementação

- O campo `ai_model` de `assessment_results` registra qual modelo respondeu.
- Se o `JSON.parse` falhar, o sistema usa `buildFallback()` de `lib/anthropic.ts`.
- Validação antes de gravar: `phase.name` é uma das 6 fases; `pathway.name` é uma das 7 trajetórias; `tension.name` é uma das 8 tensões; `actions` tem exatamente 3 itens com tipos `para_dentro`, `para_fora`, `prototipar`.
- O `label` e `score_1_to_5` da clareza são recalculados pelo sistema a partir de `total_points_0_to_10` — não dependem do que o modelo retornar nesses campos.
