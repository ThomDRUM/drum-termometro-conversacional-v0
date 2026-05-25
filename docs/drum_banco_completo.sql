-- ============================================================
-- DRUM | Banco de Dados Completo
-- ============================================================
-- Cobre dois produtos do hackathon que compartilham um banco:
--
--   A) PLATAFORMA  ("Notion melhorado") — operação da DRUM:
--      clientes, pessoas, programas, jornadas, módulos, encontros,
--      entregáveis, tarefas. Baseado na seção 11 da Especificação.
--
--   B) DIAGNÓSTICO ("Termômetro 0→1") — conversacional por voz:
--      ElevenLabs conduz a conversa, a transcrição é salva,
--      a Anthropic lê e gera o perfil + devolutiva.
--
-- O elo entre A e B é a pessoa: o diagnóstico é respondido por
-- alguém que pode ainda não ter conta; quando vira mentorado na
-- plataforma, o email reconcilia os dois lados.
--
-- Banco: PostgreSQL (roda em Butterbase, Supabase ou Postgres puro).
-- ============================================================


-- ============================================================
-- PARTE 0 — ENUMS
-- ============================================================

-- Os 3 frameworks da metodologia DRUM.
CREATE TYPE drum_framework AS ENUM (
  'life_design', 'empreendedorismo', 'transicao'
);

-- Papéis de usuário (seção 4 da Especificação).
CREATE TYPE user_role AS ENUM (
  'admin', 'fundador', 'mentor', 'mentorado',
  'sucedido', 'familiar', 'parceiro', 'observador'
);

-- Os 4 perfis de recém-formado que o diagnóstico identifica.
CREATE TYPE recem_formado_perfil AS ENUM (
  'paralisado_por_opcao',  -- opções demais, não consegue fechar portas
  'atrasado',              -- sente que todos já construíram e ele não
  'executor_sem_norte',    -- faz muita coisa, sem direção
  'esperando_permissao'    -- sabe o que quer, espera autorização
);

-- Status de objetos (seção "Status dos objetos" da Especificação).
CREATE TYPE journey_status   AS ENUM ('nao_iniciada','ativa','pausada','concluida','cancelada');
CREATE TYPE module_status    AS ENUM ('bloqueado','liberado','em_andamento','concluido','pulado');
CREATE TYPE assessment_status AS ENUM ('nao_enviado','enviado','respondido','em_devolutiva','concluido');
CREATE TYPE deliverable_status AS ENUM ('nao_iniciado','em_andamento','enviado','em_revisao','aprovado','precisa_ajuste');
CREATE TYPE task_status      AS ENUM ('aberta','em_andamento','bloqueada','concluida','cancelada');

-- Status específico da conversa por voz.
CREATE TYPE voice_call_status AS ENUM (
  'iniciada',     -- chamada começou
  'em_andamento', -- conversa rolando
  'concluida',    -- conversa terminou, transcrição disponível
  'interrompida', -- caiu / abandonada
  'falhou'        -- erro técnico
);


-- ============================================================
-- PARTE A — A PLATAFORMA ("Notion melhorado")
-- ============================================================

-- ---------- users ----------
-- Toda pessoa do sistema: admin, mentor, mentorado, familiar etc.
CREATE TABLE users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  email       text NOT NULL UNIQUE,
  role        user_role NOT NULL DEFAULT 'mentorado',
  avatar_url  text,
  ativo       boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- families ----------
-- Famílias empresárias (público da trilha de sucessão).
CREATE TABLE families (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  descricao   text,
  status      text NOT NULL DEFAULT 'lead',
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- program_templates ----------
-- Modelos de programa: Carreira, Sucessão, Empreendedorismo.
CREATE TABLE program_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        text NOT NULL,
  descricao   text,
  tipo        text NOT NULL,
  ativo       boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- module_templates ----------
-- Módulos de um programa (ex.: os 7 módulos da Trilha de Carreira).
CREATE TABLE module_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES program_templates(id),
  ordem       smallint NOT NULL,
  nome        text NOT NULL,
  objetivo    text,
  pergunta_central text,
  duracao_sugerida text
);

-- ---------- journeys ----------
-- Instância real de um programa rodando para um cliente.
CREATE TABLE journeys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id  uuid NOT NULL REFERENCES program_templates(id),
  family_id   uuid REFERENCES families(id),     -- nulo se mentorado individual
  mentorado_id uuid REFERENCES users(id),       -- nulo se jornada de família
  mentor_id   uuid REFERENCES users(id),
  status      journey_status NOT NULL DEFAULT 'nao_iniciada',
  data_inicio date,
  data_fim_prevista date,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- journey_modules ----------
-- Os módulos de uma jornada concreta, com status e progresso.
CREATE TABLE journey_modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id  uuid NOT NULL REFERENCES journeys(id),
  module_template_id uuid NOT NULL REFERENCES module_templates(id),
  status      module_status NOT NULL DEFAULT 'bloqueado',
  data_prevista date,
  concluido_em timestamptz
);

-- ---------- sessions (encontros) ----------
CREATE TABLE sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id  uuid NOT NULL REFERENCES journeys(id),
  journey_module_id uuid REFERENCES journey_modules(id),
  data        timestamptz,
  objetivo    text,
  notas_privadas    text,    -- só mentor
  notas_compartilhadas text, -- visível ao mentorado
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- deliverables (entregáveis) ----------
CREATE TABLE deliverables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id  uuid NOT NULL REFERENCES journeys(id),
  journey_module_id uuid REFERENCES journey_modules(id),
  titulo      text NOT NULL,
  conteudo    text,
  status      deliverable_status NOT NULL DEFAULT 'nao_iniciado',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- tasks (tarefas / próximos passos) ----------
CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      text NOT NULL,
  descricao   text,
  responsavel_id uuid REFERENCES users(id),
  criador_id  uuid REFERENCES users(id),
  prazo       date,
  status      task_status NOT NULL DEFAULT 'aberta',
  prioridade  text DEFAULT 'media',
  journey_id  uuid REFERENCES journeys(id),     -- vínculo opcional
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- content_items (biblioteca de repertório) ----------
CREATE TABLE content_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo      text NOT NULL,
  tipo        text,            -- texto, video, pdf, exercicio
  corpo       text,
  url         text,
  tags        text[],
  framework   drum_framework,
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- PARTE B — O DIAGNÓSTICO CONVERSACIONAL ("Termômetro 0→1")
-- ============================================================

-- ---------- assessment_templates ----------
-- Modelo do diagnóstico. Uma linha = "Termômetro 0→1".
-- 'roteiro' guarda os tópicos que o agente de voz deve cobrir
-- na conversa (não são perguntas fechadas — são temas a explorar).
CREATE TABLE assessment_templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text NOT NULL,
  descricao     text,
  framework     drum_framework NOT NULL DEFAULT 'life_design',
  publico_alvo  text NOT NULL DEFAULT 'recem_formado',
  -- roteiro: array JSON dos tópicos que a conversa deve cobrir,
  -- ex.: [ { "tema": "clareza", "objetivo": "entender se a pessoa
  --          tem direção ou opções demais" }, ... ]
  roteiro       jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- elevenlabs_agent_id: o ID do agente de voz que conduz este diagnóstico
  elevenlabs_agent_id text,
  ativo         boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------- assessment_responses ----------
-- Uma linha por diagnóstico feito. user_id e journey_id nascem
-- NULOS — a pessoa faz o diagnóstico por voz antes de ter conta.
-- O email é a chave de reconciliação com a plataforma.
CREATE TABLE assessment_responses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   uuid NOT NULL REFERENCES assessment_templates(id),
  user_id       uuid REFERENCES users(id),     -- preenchido quando vira mentorado
  journey_id    uuid REFERENCES journeys(id),  -- preenchido quando vira jornada
  nome          text,
  email         text,                          -- elo com a plataforma
  status        assessment_status NOT NULL DEFAULT 'nao_enviado',
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
);
CREATE INDEX idx_responses_email ON assessment_responses(email);

-- ---------- voice_conversations ----------
-- O coração da parte conversacional. Cada conversa de voz da
-- ElevenLabs vira uma linha aqui, ligada a uma assessment_response.
CREATE TABLE voice_conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id   uuid NOT NULL REFERENCES assessment_responses(id),
  -- ID da conversa no lado da ElevenLabs (para buscar/retomar)
  elevenlabs_conversation_id text,
  status        voice_call_status NOT NULL DEFAULT 'iniciada',
  -- transcript: a conversa completa, turno a turno. Array JSON:
  --   [ { "role": "agent", "text": "...", "ts": 0.0 },
  --     { "role": "user",  "text": "...", "ts": 4.2 }, ... ]
  -- Esta é a FONTE DE VERDADE que a Anthropic vai ler.
  transcript    jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- extracted_variables: variáveis que o agente da ElevenLabs
  -- coletou durante a conversa (data collection). Ex.:
  --   { "ansiedade": 4, "tem_projetos": false,
  --     "o_que_trava": "medo de errar" }
  -- Opcional: se o perfil for decidido só pela Anthropic, fica vazio.
  extracted_variables jsonb NOT NULL DEFAULT '{}'::jsonb,
  audio_url     text,             -- nulo se não guardar áudio
  duracao_seg   integer,
  started_at    timestamptz NOT NULL DEFAULT now(),
  ended_at      timestamptz
);
CREATE INDEX idx_voice_response ON voice_conversations(response_id);

-- ---------- assessment_results ----------
-- O diagnóstico final, gerado pela Anthropic a partir da transcrição.
CREATE TABLE assessment_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id     uuid NOT NULL UNIQUE REFERENCES assessment_responses(id),
  -- scores: confiança da Anthropic em cada perfil, ex.:
  --   { "paralisado_por_opcao": 0.7, "atrasado": 0.2,
  --     "executor_sem_norte": 0.05, "esperando_permissao": 0.05 }
  scores          jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_profile  recem_formado_perfil NOT NULL,
  -- interpretacao: a devolutiva em texto, gerada pela Anthropic
  interpretacao   text,
  -- acoes: array JSON de 3 ações para os próximos 30 dias
  acoes           jsonb NOT NULL DEFAULT '[]'::jsonb,
  anxiety_level   smallint CHECK (anxiety_level BETWEEN 1 AND 5),
  -- modelo de IA usado, para rastreio
  ai_model        text,
  -- gancho de conversão: clicou em "quero estruturar minha jornada"?
  clicked_cta     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_results_profile ON assessment_results(result_profile);


-- ============================================================
-- SEED — o template do Termômetro 0→1
-- ============================================================
INSERT INTO assessment_templates (nome, descricao, framework, publico_alvo, roteiro)
VALUES (
  'Termômetro 0→1',
  'Diagnóstico de carreira por voz para jovens recém-formados. Uma conversa de ~5 min conduzida por um agente de voz; a Anthropic lê a transcrição e identifica o perfil.',
  'life_design',
  'recem_formado',
  '[
    { "tema": "momento", "objetivo": "onde a pessoa está: recém-formada, há quanto tempo, como se sente" },
    { "tema": "clareza", "objetivo": "tem direção definida ou opções demais? consegue descartar caminhos?" },
    { "tema": "repertorio", "objetivo": "já construiu projetos? sente que está atrasada em relação aos colegas?" },
    { "tema": "travas", "objetivo": "o que impede o primeiro passo: não saber qual, medo de errar, esperar condição certa" },
    { "tema": "energia_e_risco", "objetivo": "o que dá energia e qual o apetite a risco" },
    { "tema": "futuro", "objetivo": "o que gostaria que estivesse resolvido em 1 ano" }
  ]'::jsonb
);
