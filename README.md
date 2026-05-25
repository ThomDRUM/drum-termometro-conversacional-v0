# DRUM — Termômetro 0→1

Diagnóstico de carreira por voz pra jovens recém-formados. Uma conversa de ~5 minutos com um agente de voz, transcrita e lida por um LLM, devolve uma devolutiva personalizada + 3 ações concretas pros próximos 30 dias.

Construído num hackathon usando **Next.js 16**, **ElevenLabs Conversational AI**, **Anthropic Claude**, e **Butterbase** (banco).

---

## Demo do fluxo

1. **Landing** — pitch, prova social, preview da devolutiva
2. **Cadastro** — nome + email + senha (sem auth de verdade, só pra reconciliar leads)
3. **Conversa** — widget WebSocket com waveform reativo, legenda ao vivo e timer
4. **Loading** — mensagens rotativas enquanto a Anthropic processa
5. **Devolutiva** — perfil identificado, interpretação personalizada, 3 ações, escolha uma como quebra-gelo
6. **Painel admin** (`/admin`) — leads ordenados por score, drawer com transcrição completa

## Os 4 perfis identificados

- **Paralisado por Opção** — vê caminhos demais, precisa fechar portas
- **Atrasado** — comparando o começo dela com o meio dos outros
- **Executor sem Norte** — energia sobrando, direção faltando
- **Esperando Permissão** — sabe o que quer, espera autorização

---

## Stack

| Camada | Ferramenta |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 + Fraunces/Inter (next/font) |
| Voz | ElevenLabs Agents (`@elevenlabs/react` WebSocket) |
| LLM | Anthropic Claude Opus 4.7 (`@anthropic-ai/sdk`) |
| Banco | Butterbase (Postgres-as-a-service, REST API) |
| Deploy alvo | Vercel |

---

## Setup local

### 1. Pré-requisitos

- Node 22+
- Contas em [Anthropic](https://console.anthropic.com), [ElevenLabs](https://elevenlabs.io), e [Butterbase](https://dashboard.butterbase.ai)

### 2. Banco (Butterbase)

Crie um app em butterbase.ai. Aplique o schema usando [docs/drum_banco_completo.sql](docs/drum_banco_completo.sql) como referência (este projeto aplica via MCP do Butterbase declarativamente).

Após aplicar, faça um INSERT no `assessment_templates` com o roteiro dos 6 temas (veja o final do SQL) e copie o `id` retornado pro `TERMOMETRO_TEMPLATE_ID`.

### 3. Agente de voz (ElevenLabs)

Crie um agente em https://elevenlabs.io/app/agents com:

- **Linguagem:** Portuguese (Brazil)
- **TTS Model:** `eleven_turbo_v2_5` ou `eleven_flash_v2_5` (obrigatório para PT)
- **Voz:** qualquer voz PT-BR (sugestões: Roberta `RGymW84CSmfVugnA5tvA`, Regi Piroli `QHXbC1UI61ujIZ9SUNGc`)
- **System prompt + first message:** copie de [docs/agente_voz_elevenlabs.md](docs/agente_voz_elevenlabs.md)
- **Analysis → Data Collection:** crie as 8 variáveis (`nome`, `tempo_formado`, `tem_clareza`, `excesso_de_opcoes`, `tem_projetos`, `sente_atraso`, `principal_trava`, `ansiedade`)
- **Publish** depois de configurado

Copie o `agent_id` (visível na URL ou no topo do painel).

### 4. Variáveis de ambiente

```bash
cp .env.example .env.local
# preencha com suas chaves
```

### 5. Rodar

```bash
npm install
npm run dev
```

Acesse:
- `http://localhost:3000` — fluxo público
- `http://localhost:3000/admin` — painel (use a `DRUM_ADMIN_PASSWORD` que você definiu)

> **Heads up sobre Anthropic:** se você usa Claude Code, ele exporta `ANTHROPIC_API_KEY` no shell e mascara a do `.env.local`. Rode com `env -u ANTHROPIC_API_KEY -u ANTHROPIC_BASE_URL npm run dev`.

---

## Arquitetura

```
app/
├── page.tsx                       Landing
├── landing.tsx                    Hero → cadastro → conversa
├── conversa.tsx                   Widget de voz (waveform + legenda + timer)
├── diagnostico/[id]/              Devolutiva (polling do resultado)
├── admin/                         Painel: leads scored + drawer com transcript
└── api/
    ├── auth/                      Signup/login simples (SHA-256 + salt)
    ├── conversa/start             Cria assessment_response + voice_conversation
    ├── conversa/token             Mint signed URL pra ElevenLabs WebSocket
    ├── conversa/complete          Busca transcript, chama Claude, salva resultado
    ├── diagnostico/[id]           GET resultado / PATCH meta escolhida + CTA
    └── admin/login                Cookie httpOnly com timing-safe compare

lib/
├── profiles.ts                    4 perfis + textos fallback
├── anthropic.ts                   Prompt + diagnose() + fallback
├── elevenlabs.ts                  Fetch transcript + variáveis
├── butterbase.ts                  REST wrapper
├── auth.ts                        Hash de senha (SHA-256 + salt, MVP)
├── admin.ts                       Cookie de admin
└── leads.ts                       Score de lead + agregações
```

### Fluxo de dados

```
Landing → /api/auth (cria user)
        → /api/conversa/start (cria response + voice_conversation)
        → /api/conversa/token (signed URL)
        → ElevenLabs WebSocket (~5 min)
onDisconnect → /api/conversa/complete
             → ElevenLabs GET /v1/convai/conversations/{id} (poll até done)
             → Anthropic messages.create (prompt em pt, JSON output)
             → INSERT assessment_results
             → UPDATE assessment_responses status=concluido
Redirect → /diagnostico/[id]
         → polling /api/diagnostico/[id] até ready
         → renderiza interpretação + 3 ações (escolha uma como quebra-gelo) + CTA
```

### Score de lead (painel admin)

| Sinal | Peso |
|---|---|
| `clicked_cta = true` | +40 |
| `chosen_acao_index != null` | +20 |
| `anxiety_level >= 4` | +15 |
| `duracao_seg >= 240` | +10 |
| `status = concluido` | +10 |
| Criado nas últimas 48h | +5 |

Faixas: **Quente** ≥ 70 · **Morno** 40-69 · **Frio** < 40

---

## Documentação de design

- [docs/prompt_anthropic_diagnostico.md](docs/prompt_anthropic_diagnostico.md) — system prompt da Anthropic + textos fallback
- [docs/agente_voz_elevenlabs.md](docs/agente_voz_elevenlabs.md) — config do agente de voz
- [docs/drum_banco_completo.sql](docs/drum_banco_completo.sql) — schema Postgres completo

---

## Notas de segurança

Este é código de hackathon. Antes de qualquer produção real:

- A senha é hasheada com SHA-256 + salt simples — trocar por bcrypt/argon2
- O cookie de admin armazena a senha em plaintext httpOnly — trocar por JWT assinado
- `clicked_cta` e `chosen_acao_index` no PATCH não validam ownership — proteger com sessão
- Sem rate limiting nas rotas de auth — adicionar antes de expor

---

## Licença

MIT — use, copie, modifique.
