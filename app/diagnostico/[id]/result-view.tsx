"use client";

import { useEffect, useState } from "react";
import {
  PHASES,
  PHASE_EDITORIAL,
  PATHWAY_EDITORIAL,
  ACTION_TYPE_LABELS,
  type Diagnostico,
  type ActionType,
  type ClarityLabel,
  type Phase,
} from "@/lib/taxonomy";

type ResultRow = Diagnostico & {
  clicked_cta: boolean;
  chosen_action_type: string | null;
};

type ApiResponse =
  | { ready: false }
  | { ready: true; result: ResultRow; response: { nome?: string | null }; conversa_curta?: boolean };

export default function ResultView({ responseId }: { responseId: string }) {
  const [data, setData]             = useState<ApiResponse | null>(null);
  const [ctaClicked, setCtaClicked] = useState(false);
  const [chosen, setChosen]         = useState<ActionType | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      while (!cancelled) {
        const res  = await fetch(`/api/diagnostico/${responseId}`, { cache: "no-store" });
        const json = (await res.json()) as ApiResponse;
        if (json.ready) {
          setData(json);
          if (json.result.chosen_action_type) {
            setChosen(json.result.chosen_action_type as ActionType);
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    poll();
    return () => { cancelled = true; };
  }, [responseId]);

  async function pickAction(type: ActionType) {
    setChosen(type);
    await fetch(`/api/diagnostico/${responseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chosen_action_type: type }),
    });
  }

  async function clickCta() {
    setCtaClicked(true);
    await fetch(`/api/diagnostico/${responseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clicked_cta: true }),
    });
  }

  if (!data || !data.ready) return <ResultSkeleton />;

  const { result, response } = data;
  const nome        = response?.nome;
  const ctaReady    = chosen !== null;
  const phaseEd     = PHASE_EDITORIAL[result.phase.name];
  const pathwayEd   = PATHWAY_EDITORIAL[result.pathway.name];
  const conversaCurta = data.conversa_curta ?? false;

  return (
    <div className="max-w-2xl w-full space-y-20">

      {/* ═══════════════════════════════════════════════
          SEU MOMENTO — Fase
      ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          Seu momento
        </p>

        {conversaCurta && (
          <p className="text-xs text-muted bg-surface border border-subtle rounded-xl px-4 py-3 leading-relaxed">
            Sua conversa foi mais curta que o ideal. Esta leitura é baseada em menos contexto do que o normal — pode ser menos precisa.
          </p>
        )}

        <div className="space-y-3">
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-tight">
            {result.phase.name}
          </h1>
          <p className="font-display text-lg sm:text-xl leading-relaxed text-foreground/90">
            {result.phase.short_description}
          </p>
        </div>

        <PhaseJourney current={result.phase.name} />

        {phaseEd && (
          <div className="space-y-4 pt-2 border-t border-subtle">
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-muted">O que é essa fase</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{phaseEd.definition}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-muted">O que costuma aparecer aqui</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{phaseEd.common_conflicts}</p>
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════
          SEU CAMINHO — Trajetória
      ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          Seu caminho
        </p>

        <div className="space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-tight">
            {result.pathway.name}
          </h2>
          <p className="font-display text-lg sm:text-xl leading-relaxed text-foreground/90">
            {result.pathway.short_description}
          </p>
        </div>

        {pathwayEd && (
          <div className="space-y-4 pt-2 border-t border-subtle">
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-muted">O que essa trajetória implica</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{pathwayEd.definition}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-widest text-muted">Na prática</p>
              <p className="text-sm text-foreground/80 leading-relaxed">{pathwayEd.in_practice}</p>
            </div>
          </div>
        )}

        <ClarityCard clarity={result.clarity} />
      </section>

      {/* ═══════════════════════════════════════════════
          SEU DESAFIO — Tensão + Ações
      ═══════════════════════════════════════════════ */}
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          Seu desafio
        </p>

        <div className="space-y-3">
          <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-tight">
            {result.tension.name}
          </h2>
          <p className="font-display text-lg sm:text-xl leading-relaxed text-foreground/90">
            {result.tension.short_description}
          </p>
        </div>

        <div className="space-y-5 pt-2">
          <div className="space-y-2 border-t border-subtle pt-4">
            <p className="text-xs uppercase tracking-widest text-muted">O mais importante agora</p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              O que mais importa para a DRUM não é classificar onde você está — é gerar movimento a partir do seu contexto. Escolha <strong className="text-foreground">uma</strong> dessas 3 ações como ponto de partida para sua primeira conversa com um mentor. Ele vai te perguntar como foi.
            </p>
          </div>

          <div className="space-y-3">
            {result.actions.map((action) => {
              const isChosen = chosen === action.type;
              return (
                <button
                  key={action.type}
                  onClick={() => pickAction(action.type)}
                  className={`w-full text-left p-5 rounded-2xl border transition space-y-2 ${
                    isChosen
                      ? "bg-accent-soft border-accent shadow-sm"
                      : "bg-surface border-subtle hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        isChosen ? "border-accent bg-accent" : "border-muted/40"
                      }`}
                      aria-hidden="true"
                    >
                      {isChosen && <span className="w-2 h-2 rounded-full bg-background" />}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-muted font-medium">
                      {ACTION_TYPE_LABELS[action.type]}
                    </span>
                  </div>
                  <p className={`text-base sm:text-lg font-medium leading-snug ${isChosen ? "text-foreground" : "text-foreground/85"}`}>
                    {action.title}
                  </p>
                  <p className="text-sm text-muted leading-relaxed">{action.description}</p>
                  {isChosen && (
                    <p className="text-xs text-accent/80 leading-relaxed pt-1 border-t border-accent/20">
                      {action.why_this_action}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {!chosen && (
            <p className="text-xs text-muted">Selecione uma ação para liberar o próximo passo.</p>
          )}
        </div>
      </section>

      {/* ── Ansiedade ─────────────────────────────────── */}
      {result.metadata?.anxiety_score_1_to_5 != null && (
        <p className="text-sm text-muted">
          Ansiedade declarada hoje:{" "}
          <span className="text-foreground font-medium">
            {result.metadata.anxiety_score_1_to_5}/5
          </span>
        </p>
      )}

      {/* ═══════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════ */}
      <div className="pt-8 border-t border-subtle space-y-3">
        <button
          onClick={clickCta}
          disabled={!ctaReady || ctaClicked || result.clicked_cta}
          className="w-full rounded-full bg-foreground text-background py-5 font-medium hover:bg-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {ctaClicked || result.clicked_cta
            ? "Ótimo! Vamos entrar em contato para continuar essa conversa."
            : ctaReady
              ? `Marcar conversa com a DRUM${nome ? `, ${nome}` : ""}`
              : "Escolha uma ação acima"}
        </button>
        <p className="text-xs text-muted text-center">
          Sem cobrança. A gente te chama por email para marcar a primeira conversa.
        </p>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE JOURNEY
// ─────────────────────────────────────────────────────────────

function PhaseJourney({ current }: { current: Phase }) {
  const idx = PHASES.indexOf(current);

  return (
    <div className="pt-1">
      <div className="relative flex items-center">
        <div className="absolute inset-x-0 top-[7px] h-px bg-subtle" />
        {PHASES.map((phase, i) => {
          const isActive = i === idx;
          const isPast   = i < idx;
          return (
            <div key={phase} className="relative flex-1 flex flex-col items-center gap-2">
              <div
                className={`relative z-10 rounded-full transition-all duration-500 ${
                  isActive
                    ? "w-3.5 h-3.5 bg-accent shadow-[0_0_0_3px_var(--color-background),0_0_0_4px_var(--color-accent)]"
                    : isPast
                      ? "w-2.5 h-2.5 bg-accent/40"
                      : "w-2.5 h-2.5 bg-subtle border border-muted/30"
                }`}
              />
              <span
                className={`text-[10px] leading-none text-center hidden sm:block max-w-[64px] ${
                  isActive ? "text-accent font-semibold" : isPast ? "text-muted/60" : "text-muted/30"
                }`}
              >
                {phase}
              </span>
            </div>
          );
        })}
      </div>
      <p className="sm:hidden text-xs text-accent font-medium mt-3 text-center">
        {current} · passo {idx + 1} de {PHASES.length}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CLARITY CARD
// ─────────────────────────────────────────────────────────────

const CLARITY_DESCRIPTIONS: Record<ClarityLabel, string> = {
  "Incerta":       "A trajetória ainda não está nomeada com clareza. Faz sentido explorar mais antes de apostar.",
  "Em formação":   "Há uma direção que começa a aparecer, mas a justificativa ainda está sendo construída.",
  "Clara":         "Você consegue nomear a trajetória e explicar por que ela faz sentido para você.",
};

function ClarityCard({ clarity }: { clarity: Diagnostico["clarity"] }) {
  const label = clarity.label as ClarityLabel;
  const pct   = Math.round(((clarity.score_1_to_3 - 1) / 2) * 100);

  return (
    <div className="bg-surface border border-subtle rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="space-y-0.5">
        <p className="text-xs uppercase tracking-widest text-muted">Clareza de trajetória</p>
        <p className="font-display text-5xl tracking-tight leading-none text-foreground">
          {clarity.score_1_to_3}
          <span className="text-2xl text-muted/60">/3</span>
        </p>
        <p className="text-sm text-accent font-medium">{label}</p>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted leading-relaxed">{CLARITY_DESCRIPTIONS[label]}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────

function ResultSkeleton() {
  return (
    <div className="max-w-2xl w-full space-y-20 animate-pulse">
      <div className="space-y-4">
        <div className="h-3 w-20 bg-subtle rounded" />
        <div className="h-12 w-2/3 bg-subtle rounded" />
        <div className="h-5 w-full bg-subtle rounded" />
        <div className="h-5 w-10/12 bg-subtle rounded" />
        <div className="h-6 w-full bg-subtle rounded-full" />
      </div>
      <div className="space-y-4">
        <div className="h-3 w-20 bg-subtle rounded" />
        <div className="h-10 w-1/2 bg-subtle rounded" />
        <div className="h-5 w-full bg-subtle rounded" />
        <div className="h-28 bg-subtle rounded-2xl" />
      </div>
      <div className="space-y-4">
        <div className="h-3 w-24 bg-subtle rounded" />
        <div className="h-10 w-3/4 bg-subtle rounded" />
        <div className="h-20 bg-subtle rounded-2xl" />
        <div className="h-20 bg-subtle rounded-2xl" />
        <div className="h-20 bg-subtle rounded-2xl" />
      </div>
    </div>
  );
}
